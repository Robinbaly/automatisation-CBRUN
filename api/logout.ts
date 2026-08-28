import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { clearSessionCookie } from './_lib/auth.js'

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader('Set-Cookie', clearSessionCookie())
  res.status(200).json({ ok: true })
}
