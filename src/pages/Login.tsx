import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { ErrorBanner, Field, Input, PrimaryButton } from '../components/FormKit'

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/login', { password })
      onLoggedIn()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={submit} className="card-shadow w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo-192.png" alt="CB-RUN" className="mb-3 h-16 w-16 object-contain" />
          <div className="font-display text-lg leading-tight font-semibold">CB-RUN</div>
          <div className="text-xs tracking-wide text-ink-muted uppercase">Stock</div>
        </div>

        {error && <ErrorBanner message={error} />}

        <Field label="Mot de passe">
          <Input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>

        <PrimaryButton type="submit" disabled={loading || !password} className="w-full justify-center">
          {loading ? 'Connexion…' : 'Se connecter'}
        </PrimaryButton>
      </form>
    </div>
  )
}
