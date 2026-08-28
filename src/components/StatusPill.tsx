import { labelWithoutEmoji, severityFromLabel } from '../lib/severity'

const STYLES: Record<string, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  crit: 'bg-crit-soft text-crit',
  mute: 'bg-surface-2 text-ink-muted',
}

export function StatusPill({ label }: { label: string }) {
  if (!label) return <span className="text-ink-muted text-sm">—</span>
  const severity = severityFromLabel(label)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[severity]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labelWithoutEmoji(label)}
    </span>
  )
}
