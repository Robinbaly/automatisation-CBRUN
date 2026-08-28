import { useState } from 'react'
import { Card, Kpi } from '../components/Card'
import { StatusPill } from '../components/StatusPill'
import { ErrorBanner } from '../components/FormKit'
import { useStock } from '../hooks/useStock'
import { severityFromLabel } from '../lib/severity'

const numberFmt = new Intl.NumberFormat('fr-FR')
const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export function Dashboard() {
  const { data, error, loading, refresh } = useStock(30_000)
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  if (loading && !data) {
    return <p className="text-ink-muted">Chargement du stock…</p>
  }

  if (error) {
    return (
      <div>
        <ErrorBanner message={error} />
        <button onClick={refresh} className="text-sm font-semibold text-red underline">
          Réessayer
        </button>
      </div>
    )
  }

  if (!data) return null

  const { vrac, variantes, kraft } = data

  const criticalCount =
    vrac.filter((v) => severityFromLabel(v.statut) === 'crit').length +
    variantes.filter(
      (v) =>
        severityFromLabel(v.sachets.statut) === 'crit' ||
        severityFromLabel(v.sachetsVierges.statut) === 'crit' ||
        severityFromLabel(v.etiquette1.statut) === 'crit' ||
        severityFromLabel(v.etiquette2.statut) === 'crit' ||
        severityFromLabel(v.etiquetteVerso.statut) === 'crit',
    ).length +
    kraft.filter((k) => severityFromLabel(k.statut) === 'crit').length

  const totalVrac = vrac.reduce((sum, v) => sum + v.stockActuel, 0)
  const totalSachets = variantes.reduce((sum, v) => sum + v.sachets.actuel, 0)
  const totalVierges = variantes.reduce((sum, v) => sum + v.sachetsVierges.actuel, 0)

  const vracSuivi = vrac.filter((v) => v.statut && severityFromLabel(v.statut) !== 'mute')
  const variantesSuivies = variantes.filter((v) => v.sachets.statut && severityFromLabel(v.sachets.statut) !== 'mute')
  const variantesAvecEtiquettes = variantes.filter(
    (v) => v.etiquette1.seuil || v.etiquette2.seuil || v.etiquetteVerso.seuil || v.sachetsVierges.seuil,
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-[26px] font-semibold">État du stock</h1>
        <div className="flex items-center gap-3 text-[13px] text-ink-muted capitalize">
          <span>{today} · lecture directe depuis Airtable</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="normal-case text-red hover:text-red-strong font-semibold disabled:opacity-50"
          >
            {refreshing ? 'Actualisation…' : 'Actualiser'}
          </button>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-crit/30 bg-crit-soft px-4 py-3 text-[13.5px] font-medium text-crit">
          ⚠ {criticalCount} ligne{criticalCount > 1 ? 's' : ''} en stock critique — vrac, sachets ou emballage sous le seuil
          d'alerte
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Kpi label="Vrac suivi" value={`${numberFmt.format(totalVrac)} g`} />
        <Kpi label="Sachets prêts à la vente" value={`${numberFmt.format(totalSachets)} u`} />
        <Kpi label="Sachets vierges étiquetés" value={`${numberFmt.format(totalVierges)} u`} />
        <Kpi label="Alertes critiques" value={criticalCount} tone={criticalCount > 0 ? 'crit' : undefined} />
      </div>

      <Card title="Stock vrac (g)" hint="Catalogue_Produits">
        <Table
          columns={['Référence', 'Stock actuel', 'Seuil critique', 'Statut']}
          rows={vracSuivi.map((v) => [
            v.nom,
            <span key="actuel" className="num">
              {numberFmt.format(v.stockActuel)} g
            </span>,
            <span key="seuil" className="num text-ink-muted">
              {numberFmt.format(v.seuilCritique)} g
            </span>,
            <StatusPill key="statut" label={v.statut} />,
          ])}
        />
      </Card>

      <Card title="Stock sachets prêts à la vente" hint="Variantes">
        <Table
          columns={['Référence', 'Stock actuel', 'Seuil critique', 'Statut']}
          rows={variantesSuivies.map((v) => [
            v.libelle,
            <span key="actuel" className="num">
              {numberFmt.format(v.sachets.actuel)} u
            </span>,
            <span key="seuil" className="num text-ink-muted">
              {numberFmt.format(v.sachets.seuil)} u
            </span>,
            <StatusPill key="statut" label={v.sachets.statut} />,
          ])}
        />
      </Card>

      <Card title="Stock emballage vierge — kraft" hint="Stock_Emballage_Vierge">
        <Table
          columns={['Format', 'Stock actuel', 'Seuil critique', 'Statut']}
          rows={kraft.map((k) => [
            k.format,
            <span key="actuel" className="num">
              {numberFmt.format(k.stockActuel)} u
            </span>,
            <span key="seuil" className="num text-ink-muted">
              {numberFmt.format(k.seuilCritique)} u
            </span>,
            <StatusPill key="statut" label={k.statut} />,
          ])}
        />
      </Card>

      <Card title="Stock emballage vierge — étiquettes (par référence)" hint="Variantes">
        <Table
          columns={['Référence', 'Étiq. 1 (haut)', 'Étiq. 2 (bas)', 'Verso (AR)', 'Sachets vierges étiquetés']}
          rows={variantesAvecEtiquettes.map((v) => [
            v.libelle,
            <EtiquetteCell key="e1" value={v.etiquette1.actuel} statut={v.etiquette1.statut} />,
            <EtiquetteCell key="e2" value={v.etiquette2.actuel} statut={v.etiquette2.statut} />,
            <EtiquetteCell key="verso" value={v.etiquetteVerso.actuel} statut={v.etiquetteVerso.statut} />,
            <EtiquetteCell key="vierges" value={v.sachetsVierges.actuel} statut={v.sachetsVierges.statut} />,
          ])}
        />
      </Card>
    </div>
  )
}

function EtiquetteCell({ value, statut }: { value: number; statut: string }) {
  const severity = severityFromLabel(statut)
  return (
    <span className={`num ${severity === 'crit' ? 'font-semibold text-crit' : severity === 'warn' ? 'text-warn' : ''}`}>
      {numberFmt.format(value)}
    </span>
  )
}

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((c, i) => (
              <th
                key={c}
                className={`px-5 py-2.5 text-[11.5px] font-semibold tracking-wide text-ink-muted uppercase ${
                  i > 0 ? 'text-right' : 'text-left'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-6 text-center text-ink-muted">
                Aucune référence suivie pour le moment.
              </td>
            </tr>
          )}
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-border hover:bg-surface-2">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-5 py-2.5 ${ci > 0 ? 'text-right' : 'text-left'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
