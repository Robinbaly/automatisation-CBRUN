// Minimal shape of the request/response objects Vercel's Node runtime passes to
// a function handler. Defined locally instead of depending on the @vercel/node
// package (dev-only type dependency with a heavy, vulnerable transitive tree —
// see npm audit) since we only ever touch these few members.

export interface ApiRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}

export interface ApiResponse {
  status(code: number): ApiResponse
  json(body: unknown): void
  setHeader(name: string, value: string): void
}
