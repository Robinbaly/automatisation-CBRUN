import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { cookieHeader, isAuthenticated } from './_lib/auth.js'

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.status(200).json({ authenticated: isAuthenticated(cookieHeader(req)) })
}
