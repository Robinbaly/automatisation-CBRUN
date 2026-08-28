import { useMemo, useState } from 'react'
import { ErrorBanner, Field, FormShell, Input, PrimaryButton, Row2, Select, SideStat, SuccessBanner } from '../components/FormKit'
import { PageHead } from './Reception'
import { useStock } from '../hooks/useStock'
import { api, ApiError } from '../lib/api'

const MOTIFS_CADEAU = [
  'Découverte prospect/particulier',
  'Offre promo (ex. 10 achetés = 1 offert)',
  'Geste commercial / fidélisation',
]

const numberFmt = new Intl.NumberFormat('fr-FR')

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function CadeauPerte() {
  const { data, loading, error: stockError } = useStock()
  const [type, setType] = useState<'Cadeau' | 'Perte'>('Cadeau')
  const [varianteId, setVarianteId] = useState('')
  const [quantite, setQuantite] = useState<number | ''>('')
  const [date, setDate] = useState(today())
  const [motif, setMotif] = useState(MOTIFS_CADEAU[0])
  const [beneficiaire, setBeneficiaire] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const variante = useMemo(() => data?.variantes.find((v) => v.id === varianteId), [data, varianteId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!varianteId) {
      setError('Sélectionne une référence.')
      return
    }
    if (!quantite || quantite <= 0) {
      setError('Indique une quantité supérieure à 0.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/sorties', {
        type,
        varianteId,
        quantite,
        date,
        motif: type === 'Cadeau' ? motif : undefined,
        beneficiaire: beneficiaire || undefined,
        notes: type === 'Perte' ? notes || undefined : undefined,
      })
      setSuccess(`${type === 'Cadeau' ? 'Cadeau' : 'Perte'} enregistré${type === 'Cadeau' ? '' : 'e'}. Le stock de sachets se met à jour dans Airtable.`)
      setQuantite('')
      setBeneficiaire('')
      setNotes('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHead title="Cadeau / Perte" />
      <FormShell
        kicker="Sortie de stock sans vente"
        title="Saisir une sortie"
        description="Sortie de sachets prêts à la vente sans facturation : cadeau client ou perte constatée."
        form={
          <form onSubmit={submit}>
            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}
            {stockError && <ErrorBanner message={stockError} />}

            <div className="mb-5 flex overflow-hidden rounded-lg border border-border">
              {(['Cadeau', 'Perte'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 text-[13.5px] font-semibold transition-colors ${
                    type === t ? 'bg-red text-white' : 'text-ink-muted hover:bg-surface-2'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Field label="Référence (sachet)">
              <Select value={varianteId} onChange={(e) => setVarianteId(e.target.value)} disabled={loading}>
                <option value="">— Sélectionner —</option>
                {data?.variantes.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.libelle}
                  </option>
                ))}
              </Select>
            </Field>

            <Row2>
              <Field label="Quantité (sachets)">
                <Input type="number" min={0} value={quantite} onChange={(e) => setQuantite(e.target.value === '' ? '' : Number(e.target.value))} />
              </Field>
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </Row2>

            {type === 'Cadeau' ? (
              <>
                <Field label="Motif">
                  <Select value={motif} onChange={(e) => setMotif(e.target.value)}>
                    {MOTIFS_CADEAU.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Bénéficiaire" optional>
                  <Input value={beneficiaire} onChange={(e) => setBeneficiaire(e.target.value)} placeholder="ex. nom du client ou du prospect" />
                </Field>
              </>
            ) : (
              <Field label="Motif / commentaire" optional>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ex. sachet abîmé, casse au transport…" />
              </Field>
            )}

            <PrimaryButton type="submit" disabled={submitting}>
              Enregistrer la sortie
            </PrimaryButton>
          </form>
        }
        side={
          <>
            <div className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">Impact stock</div>
            <SideStat label="Stock actuel" value={variante ? `${numberFmt.format(variante.sachets.actuel)} u` : '—'} />
            <SideStat label="Sortie" value={quantite ? `−${quantite} u` : '—'} tone={quantite ? 'minus' : undefined} />
            <SideStat
              label="Nouveau stock estimé"
              value={variante && quantite ? `${numberFmt.format(variante.sachets.actuel - Number(quantite))} u` : '—'}
            />
          </>
        }
      />
    </div>
  )
}
