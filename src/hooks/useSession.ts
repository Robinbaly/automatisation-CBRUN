import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'

export function useSession() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ authenticated: boolean }>('/api/session')
      setAuthenticated(res.authenticated)
    } catch {
      setAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { authenticated, refresh }
}
