export type Severity = 'ok' | 'warn' | 'crit' | 'mute'

/** Airtable's status formulas return labels like "✅ OK", "⚠️ Critique", "🟠 À surveiller", "⚪️ Non suivi". */
export function severityFromLabel(label: string): Severity {
  const l = label.toLowerCase()
  if (l.includes('critique')) return 'crit'
  if (l.includes('surveiller')) return 'warn'
  if (l.includes('ok')) return 'ok'
  return 'mute'
}

export function labelWithoutEmoji(label: string): string {
  return label.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}️]/gu, '').trim() || label
}
