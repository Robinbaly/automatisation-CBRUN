import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../lib/api'
import type { StockData } from '../lib/types'

export function useStock() {
  const [data, setData] = useState<StockData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
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

  return { data, error, loading, refresh }
}
