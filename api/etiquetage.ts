import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { createRecord, humanRef, TABLES } from './_lib/airtable.js'
import { optionalString, requireNumber, requireString, withPost } from './_lib/handler.js'

export default withPost(async (req: ApiRequest, res: ApiResponse) => {
  const body = (req.body || {}) as Record<string, unknown>

  const fields: Record<string, unknown> = {
    'Référence Opération': humanRef('ETQ'),
    'Date Étiquetage': requireString(body, 'date'),
    'Variante Concernée': [requireString(body, 'varianteId')],
    'Format Kraft Utilisé': [requireString(body, 'formatKraftId')],
    'Nombre Sachets Étiquetés Produits': requireNumber(body, 'nombreSachetsEtiquetesProduits'),
  }

  const notes = optionalString(body, 'notes')
  if (notes) fields['Notes'] = notes

  const record = await createRecord(TABLES.operationsEtiquetage, fields)
  res.status(201).json({ id: record.id })
})
