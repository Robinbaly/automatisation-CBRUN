import type { ApiRequest, ApiResponse } from './http-types.js'
import { requireAuth } from './auth.js'
import { AirtableError } from './airtable.js'

export class ValidationError extends Error {}

/** Wraps a POST handler with auth + consistent error → JSON translation. */
export function withPost(fn: (req: ApiRequest, res: ApiResponse) => Promise<void>) {
  return async (req: ApiRequest, res: ApiResponse) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Méthode non autorisée' })
      return
    }
    if (!requireAuth(req, res)) return

    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message })
        return
      }
      if (err instanceof AirtableError) {
        res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message })
        return
      }
      console.error(err)
      res.status(500).json({ error: 'Erreur inattendue côté serveur.' })
    }
  }
}

export function requireString(body: Record<string, unknown>, key: string): string {
  const v = body[key]
  if (typeof v !== 'string' || !v.trim()) {
    throw new ValidationError(`Le champ "${key}" est requis.`)
  }
  return v.trim()
}

export function requireNumber(body: Record<string, unknown>, key: string): number {
  const v = body[key]
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) {
    throw new ValidationError(`Le champ "${key}" doit être un nombre.`)
  }
  return n
}

export function optionalString(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}
