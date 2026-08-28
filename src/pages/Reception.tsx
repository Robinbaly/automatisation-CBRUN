import { useMemo, useState } from 'react'
import { ErrorBanner, Field, FormShell, Input, PrimaryButton, Row2, Select, SideStat, SuccessBanner } from '../components/FormKit'
import { useStock } from '../hooks/useStock'
import { api, ApiError } from '../lib/api'

const TYPES_ACHAT = [
  { value: 'Vrac CBD', label: 'Vrac CBD' },
  { value: 'Sachets kraft', label: 'Sachets kraft' },
  { value: 'Étiquette 1 (Haut)', label: 'Étiquette 1 (Haut)' },
  { value: 'Étiquette 2 (Bas)', label: 'Étiquette 2 (Bas)' },
  { value: 'Étiquette Verso (AR)', label: 'Étiquette Verso (AR)' },
  { value: 'Autre', label: 'Autre' },
] as const

const numberFmt = new Intl.NumberFormat('fr-FR')

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function Reception() {
  const { data, loading, error: stockError } = useStock()
  const [typeAchat, setTypeAchat] = useState<(typeof TYPES_ACHAT)[number]['value']>('Vrac CBD')
  const [refId, setRefId] = useState('')
  const [quantite, setQuantite] = useState<number | ''>('')
  const [date, setDate] = useState(today())
  const [fournisseur, setFournisseur] = useState('')
  const [referenceFacture, setReferenceFacture] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isVrac = typeAchat === 'Vrac CBD'
  const isKraft = typeAchat === 'Sachets kraft'
  const isEtiquette = typeAchat.startsWith('Étiquette')
  const isAutre = typeAchat === 'Autre'

  const options = useMemo(() => {
    if (!data) return []
    if (isVrac) return data.vrac.map((v) => ({ id: v.id, label: v.nom, current: v.stockActuel }))
    if (isKraft) return data.kraft.map((k) => ({ id: k.id, label: k.format, current: k.stockActuel }))
    if (isEtiquette) return data.variantes.map((v) => ({ id: v.id, label: v.libelle, current: undefined }))
    return []
  }, [data, isVrac, isKraft, isEtiquette])

  const selected = options.find((o) => o.id === refId)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isAutre && !refId) {
      setError('Sélectionne une référence.')
      return
    }
    if (!quantite || quantite <= 0) {
      setError('Indique une quantité supérieure à 0.')
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        typeAchat,
        date,
        fournisseur: fournisseur || undefined,
        referenceFacture: referenceFacture || undefined,
      }
      if (isVrac) {
        payload.produitVracId = refId
        payload.quantiteG = quantite
      } else if (isKraft) {
        payload.formatKraftId = refId
        payload.quantiteUnites = quantite
      } else if (isEtiquette) {
        payload.varianteId = refId
        payload.quantiteUnites = quantite
      }

      await api.post('/api/receptions', payload)
      setSuccess('Réception enregistrée. Le stock se met à jour dans Airtable.')
      setRefId('')
      setQuantite('')
      setReferenceFacture('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.")
    } finally {
      setSubmitting(false)
    }
  }

  const unite = isVrac ? 'g' : 'u'

  return (
    <div>
      <PageHead title="Réception fournisseur" />
      <FormShell
        kicker={typeAchat}
        title="Enregistrer une réception"
        description="Ajoute du vrac, du kraft ou des étiquettes reçus du fournisseur. Le stock correspondant se recalcule automatiquement dans Airtable."
        form={
          <form onSubmit={submit}>
            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}
            {stockError && <ErrorBanner message={stockError} />}

            <Field label="Type d'achat">
              <Select
                value={typeAchat}
                onChange={(e) => {
                  setTypeAchat(e.target.value as typeof typeAchat)
                  setRefId('')
                }}
              >
                {TYPES_ACHAT.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>

            {!isAutre && (
              <Field label={isVrac ? 'Référence produit (vrac)' : isKraft ? 'Format emballage' : 'Référence concernée'}>
                <Select value={refId} onChange={(e) => setRefId(e.target.value)} disabled={loading}>
                  <option value="">— Sélectionner —</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Row2>
              <Field label={`Quantité reçue (${unite})`}>
                <Input
                  type="number"
                  min={0}
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Field>
              <Field label="Date réception">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </Row2>

            <Field label="Fournisseur" optional>
              <Input value={fournisseur} onChange={(e) => setFournisseur(e.target.value)} placeholder="Nom du fournisseur" />
            </Field>
            <Field label="Référence facture" optional>
              <Input value={referenceFacture} onChange={(e) => setReferenceFacture(e.target.value)} placeholder="ex. FAC0412" />
            </Field>

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement…' : 'Enregistrer la réception'}
            </PrimaryButton>
          </form>
        }
        side={
          <>
            <div className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">Aperçu du stock</div>
            <SideStat label="Stock actuel" value={selected?.current !== undefined ? `${numberFmt.format(selected.current)} ${unite}` : '—'} />
            <SideStat label="+ Cette réception" value={quantite ? `+${numberFmt.format(Number(quantite))} ${unite}` : '—'} tone="plus" />
            <SideStat
              label="Nouveau stock estimé"
              value={
                selected?.current !== undefined && quantite
                  ? `${numberFmt.format(selected.current + Number(quantite))} ${unite}`
                  : '—'
              }
            />
          </>
        }
      />
    </div>
  )
}

export function PageHead({ title }: { title: string }) {
  const label = new Date().toLocaleDateString('fr-FR')
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <h1 className="font-display text-[26px] font-semibold">{title}</h1>
      <div className="text-[13px] text-ink-muted">{label}</div>
    </div>
  )
}
