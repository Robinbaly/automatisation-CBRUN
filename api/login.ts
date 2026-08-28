import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { checkPassword, makeSessionCookie } from './_lib/auth.js'

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' })
    return
  }

  const body = (req.body || {}) as Record<string, unknown>
  const password = typeof body.password === 'string' ? body.password : ''

  if (!process.env.APP_PASSWORD) {
    res.status(500).json({ error: "Le mot de passe de l'application n'est pas configuré côté serveur (APP_PASSWORD)." })
    return
  }

  if (!password || !checkPassword(password)) {
    res.status(401).json({ error: 'Mot de passe incorrect.' })
    return
  }

  res.setHeader('Set-Cookie', makeSessionCookie())
  res.status(200).json({ ok: true })
}
