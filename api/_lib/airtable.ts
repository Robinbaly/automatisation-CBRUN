// Thin wrapper around the Airtable REST API.
// The Personal Access Token never reaches the browser: every call from the
// frontend goes through one of the /api/* serverless functions in this folder,
// which are the only place AIRTABLE_TOKEN is read from.

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appxDtzVHHtBR8qnD' // "CBRUN - ERP"

export const TABLES = {
  catalogueProduits: 'tbl0T7qOZWqrepias', // Catalogue_Produits (vrac)
  variantes: 'tbldJ1dfeEGJWz17o', // Variantes (sachets prêts à la vente)
  receptionsFournisseur: 'tbl0aNHdNr8XqI10T', // Réceptions_Fournisseur
  operationsEmpaquetage: 'tbl6xw2byqtrvd2FM', // Opérations_Empaquetage
  stockEmballageVierge: 'tblrLBnA4EddCK7ps', // Stock_Emballage_Vierge (kraft)
  operationsEtiquetage: 'tblZlUs9CcUvE4H9E', // Opérations_Étiquetage
  lignesDeVente: 'tblY7LJapTae1DOOT', // Lignes de Vente (cadeau / perte)
} as const

export class AirtableError extends Error {
  status: number
  airtableType?: string

  constructor(message: string, status: number, airtableType?: string) {
    super(message)
    this.name = 'AirtableError'
    this.status = status
    this.airtableType = airtableType
  }
}

function token(): string {
  const t = process.env.AIRTABLE_TOKEN
  if (!t) {
    throw new AirtableError(
      "Le serveur n'a pas de clé API Airtable configurée (variable d'environnement AIRTABLE_TOKEN manquante).",
      500,
    )
  }
  return t
}

type AirtableErrorBody = { error?: { message?: string; type?: string } }

async function airtableFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as AirtableErrorBody | null
    const airtableMessage = body?.error?.message || body?.error?.type || res.statusText
    // Airtable's error message here is what tells us a field name/type doesn't
    // match what we expect (e.g. UNKNOWN_FIELD_NAME, INVALID_VALUE_FOR_COLUMN).
    throw new AirtableError(`Airtable a refusé la requête : ${airtableMessage}`, res.status, body?.error?.type)
  }

  return (await res.json()) as T
}

export type AirtableRecord = {
  id: string
  createdTime: string
  fields: Record<string, unknown>
}

type ListRecordsResponse = { records: AirtableRecord[]; offset?: string }
type CreateRecordsResponse = { records: AirtableRecord[] }

export async function listRecords(
  tableId: string,
  opts: { fields?: string[]; filterByFormula?: string; sort?: { field: string; direction?: 'asc' | 'desc' }[] } = {},
): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = []
  let offset: string | undefined

  const qs = new URLSearchParams()
  for (const f of opts.fields || []) qs.append('fields[]', f)
  if (opts.filterByFormula) qs.set('filterByFormula', opts.filterByFormula)
  ;(opts.sort || []).forEach((s, i) => {
    qs.set(`sort[${i}][field]`, s.field)
    qs.set(`sort[${i}][direction]`, s.direction || 'asc')
  })

  do {
    if (offset) qs.set('offset', offset)
    else qs.delete('offset')
    const page = await airtableFetch<ListRecordsResponse>(`/${tableId}?${qs.toString()}`)
    records.push(...(page.records || []))
    offset = page.offset
  } while (offset)

  return records
}

export async function createRecord(tableId: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
  const body = await airtableFetch<CreateRecordsResponse>(`/${tableId}`, {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }], typecast: false }),
  })
  return body.records[0]
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function humanRef(prefix: string): string {
  const now = new Date()
  const stamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${prefix}-${stamp}-${rand}`
}
