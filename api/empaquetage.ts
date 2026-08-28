import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { createRecord, humanRef, TABLES } from './_lib/airtable.js'
import { optionalString, requireNumber, requireString, withPost } from './_lib/handler.js'

export default withPost(async (req: ApiRequest, res: ApiResponse) => {
  const body = (req.body || {}) as Record<string, unknown>

  const fields: Record<string, unknown> = {
    'Référence Opération': humanRef('EMP'),
    'Date Opération': requireString(body, 'date'),
    'Variante Destination (Sachet)': [requireString(body, 'varianteId')],
    'Produit Source (Vrac)': [requireString(body, 'produitVracId')],
    'Poids Vrac Utilisé (g)': requireNumber(body, 'poidsVracUtiliseG'),
    'Nombre Sachets Obtenus': requireNumber(body, 'nombreSachetsObtenus'),
  }

  const notes = optionalString(body, 'notes')
  if (notes) fields['Notes'] = notes

  const record = await createRecord(TABLES.operationsEmpaquetage, fields)
  res.status(201).json({ id: record.id })
})
