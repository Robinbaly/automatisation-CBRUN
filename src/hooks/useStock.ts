import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import type { StockData } from '../lib/types'

/**
 * Always reads live from Airtable (no local copy is ever kept), so a change made
 * directly in Airtable shows up on the next fetch. `pollMs` additionally re-fetches
 * on an interval for screens people leave open (the Dashboard), and every screen
 * re-fetches when the tab/app regains focus (e.g. switching back from Airtable).
 */
export function useStock(pollMs?: number) {
  const [data, setData] = useState<StockData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const res = await api.get<StockData>('/api/stock')
      setData(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger le stock.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  useEffect(() => {
    if (!pollMs) return
    const id = setInterval(refresh, pollMs)
    return () => clearInterval(id)
  }, [pollMs, refresh])

  return { data, error, loading, refresh }
}
