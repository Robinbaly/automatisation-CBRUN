import type { PropsWithChildren, ReactNode } from 'react'

export function Card({ title, hint, children }: PropsWithChildren<{ title: string; hint?: string }>) {
  return (
    <div className="card-shadow mb-6 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-[17px] font-semibold">{title}</h2>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function Kpi({ label, value, tone }: { label: string; value: ReactNode; tone?: 'crit' }) {
  return (
    <div className="card-shadow rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</div>
      <div className={`num text-2xl font-semibold ${tone === 'crit' ? 'text-crit' : ''}`}>{value}</div>
    </div>
  )
}
