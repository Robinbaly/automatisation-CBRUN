import type { PropsWithChildren, SelectHTMLAttributes, InputHTMLAttributes } from 'react'

export function Field({ label, optional, children }: PropsWithChildren<{ label: string; optional?: boolean }>) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label} {optional && <span className="font-normal text-ink-muted">(optionnel)</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-red/40'

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className || ''}`} />
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const isNumeric = props.type === 'number' || props.type === 'date'
  return <input {...props} className={`${inputClass} ${isNumeric ? 'num' : ''} ${props.className || ''}`} />
}

export function Row2({ children }: PropsWithChildren) {
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>
}

export function PrimaryButton({ children, ...props }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      {...props}
      className="mt-1.5 inline-flex items-center gap-2 rounded-lg bg-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}

export function FormShell({
  kicker,
  title,
  description,
  form,
  side,
}: {
  kicker: string
  title: string
  description: string
  form: React.ReactNode
  side?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,480px)_300px]">
      <div className="card-shadow rounded-2xl border border-border bg-surface p-7">
        <div className="mb-1 text-xs font-semibold tracking-wide text-red uppercase">{kicker}</div>
        <h2 className="font-display mb-1.5 text-xl font-semibold">{title}</h2>
        <p className="mb-6 text-[13.5px] text-ink-muted">{description}</p>
        {form}
      </div>
      {side && <div className="card-shadow rounded-2xl border border-border bg-surface p-5">{side}</div>}
    </div>
  )
}

export function SideStat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'plus' | 'minus' }) {
  return (
    <div className="flex items-baseline justify-between border-t border-border py-2.5 first:border-t-0 first:pt-0">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={`num text-[15px] font-semibold ${tone === 'plus' ? 'text-ok' : tone === 'minus' ? 'text-crit' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-crit/30 bg-crit-soft px-4 py-3 text-[13.5px] font-medium text-crit">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  )
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-ok/30 bg-ok-soft px-4 py-3 text-[13.5px] font-medium text-ok">
      <span>✓</span>
      <span>{message}</span>
    </div>
  )
}
