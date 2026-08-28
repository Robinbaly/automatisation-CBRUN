import { useMemo, useState } from 'react'
import { ErrorBanner, Field, FormShell, Input, PrimaryButton, Row2, Select, SideStat, SuccessBanner } from '../components/FormKit'
import { PageHead } from './Reception'
import { useStock } from '../hooks/useStock'
import { api, ApiError } from '../lib/api'

const numberFmt = new Intl.NumberFormat('fr-FR')

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function Empaquetage() {
  const { data, loading, error: stockError } = useStock()
  const [varianteId, setVarianteId] = useState('')
  const [poidsVracUtiliseG, setPoids] = useState<number | ''>('')
  const [nombreSachetsObtenus, setSachets] = useState<number | ''>('')
  const [date, setDate] = useState(today())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const variante = useMemo(() => data?.variantes.find((v) => v.id === varianteId), [data, varianteId])

  const sachetsTheoriques =
    variante?.grammage && typeof poidsVracUtiliseG === 'number' ? Math.floor(poidsVracUtiliseG / variante.grammage) : undefined
  const ecartG =
    variante?.grammage && typeof poidsVracUtiliseG === 'number' && typeof nombreSachetsObtenus === 'number'
      ? poidsVracUtiliseG - nombreSachetsObtenus * variante.grammage
      : undefined

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!varianteId || !variante?.produitMaitreId) {
      setError('Sélectionne une référence de sachet (avec un vrac source rattaché dans Airtable).')
      return
    }
    if (!poidsVracUtiliseG || poidsVracUtiliseG <= 0) {
      setError('Indique le poids de vrac utilisé.')
      return
    }
    if (!nombreSachetsObtenus || nombreSachetsObtenus <= 0) {
      setError('Indique le nombre de sachets obtenus.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/empaquetage', {
        varianteId,
        produitVracId: variante.produitMaitreId,
        poidsVracUtiliseG,
        nombreSachetsObtenus,
        date,
      })
      setSuccess('Empaquetage enregistré. Vrac et sachets se recalculent automatiquement dans Airtable.')
      setPoids('')
      setSachets('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHead title="Empaquetage" />
      <FormShell
        kicker="Vrac → sachet prêt à la vente"
        title="Enregistrer un empaquetage"
        description="Transforme du vrac en sachets prêts à la vente. Décrémente le vrac, incrémente les sachets prêts à la vente."
        form={
          <form onSubmit={submit}>
            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}
            {stockError && <ErrorBanner message={stockError} />}

            <Field label="Référence (sachet à produire)">
              <Select value={varianteId} onChange={(e) => setVarianteId(e.target.value)} disabled={loading}>
                <option value="">— Sélectionner —</option>
                {data?.variantes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.libelle}
                    {v.produitMaitreNom ? ` — vrac source : ${v.produitMaitreNom}` : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Row2>
              <Field label="Poids vrac utilisé (g)">
                <Input type="number" min={0} value={poidsVracUtiliseG} onChange={(e) => setPoids(e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
              <Field label="Nombre de sachets obtenus">
                <Input type="number" min={0} value={nombreSachetsObtenus} onChange={(e) => setSachets(e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
            </Row2>

            <Field label="Date opération">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement…' : "Enregistrer l'empaquetage"}
            </PrimaryButton>
          </form>
        }
        side={
          <>
            <div className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">Vérification</div>
            <SideStat label="Grammage référence" value={variante ? `${numberFmt.format(variante.grammage)} g` : '—'} />
            <SideStat label="Sachets théoriques" value={sachetsTheoriques !== undefined ? numberFmt.format(sachetsTheoriques) : '—'} />
            <SideStat
              label="Écart"
              value={ecartG !== undefined ? `${ecartG > 0 ? '+' : ''}${numberFmt.format(ecartG)} g` : '—'}
              tone={ecartG !== undefined && ecartG !== 0 ? (ecartG > 0 ? 'plus' : 'minus') : undefined}
            />
            <SideStat
              label="Vrac restant après"
              value={
                variante && typeof poidsVracUtiliseG === 'number'
                  ? `${numberFmt.format(
                      (data?.vrac.find((v) => v.id === variante.produitMaitreId)?.stockActuel ?? 0) - poidsVracUtiliseG,
                    )} g`
                  : '—'
              }
            />
          </>
        }
      />
    </div>
  )
}
