import { useMemo, useState } from 'react'
import { ErrorBanner, Field, FormShell, Input, PrimaryButton, Row2, Select, SideStat, SuccessBanner } from '../components/FormKit'
import { PageHead } from './Reception'
import { useStock } from '../hooks/useStock'
import { api, ApiError } from '../lib/api'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function Etiquetage() {
  const { data, loading, error: stockError } = useStock()
  const [varianteId, setVarianteId] = useState('')

  const variantesEtiquetables = useMemo(
    () =>
      (data?.variantes ?? []).filter(
        (v) => (v.categorie === 'Fleur' || v.categorie === 'Résine') && v.statut === 'Actif',
      ),
    [data],
  )
  const [formatKraftId, setFormatKraftId] = useState('')
  const [nombre, setNombre] = useState<number | ''>('')
  const [date, setDate] = useState(today())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!varianteId) {
      setError('Sélectionne une référence.')
      return
    }
    if (!formatKraftId) {
      setError('Sélectionne le format de kraft utilisé.')
      return
    }
    if (!nombre || nombre <= 0) {
      setError('Indique le nombre de sachets étiquetés produits.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/etiquetage', {
        varianteId,
        formatKraftId,
        nombreSachetsEtiquetesProduits: nombre,
        date,
      })
      setSuccess('Étiquetage enregistré. Kraft, étiquettes et sachets vierges se recalculent automatiquement dans Airtable.')
      setNombre('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHead title="Étiquetage" />
      <FormShell
        kicker="Kraft + étiquettes → sachet vierge étiqueté"
        title="Enregistrer un étiquetage"
        description="Colle les 3 étiquettes (haut, bas, verso) sur des sachets kraft vierges. Décrémente le kraft et les 3 étiquettes, incrémente les sachets vierges étiquetés."
        form={
          <form onSubmit={submit}>
            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}
            {stockError && <ErrorBanner message={stockError} />}

            <Field label="Référence concernée">
              <Select value={varianteId} onChange={(e) => setVarianteId(e.target.value)} disabled={loading}>
                <option value="">— Sélectionner —</option>
                {variantesEtiquetables.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.libelle}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Format kraft utilisé">
              <Select value={formatKraftId} onChange={(e) => setFormatKraftId(e.target.value)} disabled={loading}>
                <option value="">— Sélectionner —</option>
                {data?.kraft.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.format}
                  </option>
                ))}
              </Select>
            </Field>

            <Row2>
              <Field label="Nombre de sachets étiquetés produits">
                <Input type="number" min={0} value={nombre} onChange={(e) => setNombre(e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
              <Field label="Date étiquetage">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </Row2>

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement…' : "Enregistrer l'étiquetage"}
            </PrimaryButton>
          </form>
        }
        side={
          <>
            <div className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">Consommation associée</div>
            <SideStat label="Kraft utilisé" value={nombre ? `−${nombre} u` : '—'} tone={nombre ? 'minus' : undefined} />
            <SideStat label="Étiquette 1 (haut)" value={nombre ? `−${nombre} u` : '—'} tone={nombre ? 'minus' : undefined} />
            <SideStat label="Étiquette 2 (bas)" value={nombre ? `−${nombre} u` : '—'} tone={nombre ? 'minus' : undefined} />
            <SideStat label="Verso (AR)" value={nombre ? `−${nombre} u` : '—'} tone={nombre ? 'minus' : undefined} />
            <SideStat label="Sachets vierges étiquetés" value={nombre ? `+${nombre} u` : '—'} tone={nombre ? 'plus' : undefined} />
          </>
        }
      />
    </div>
  )
}
