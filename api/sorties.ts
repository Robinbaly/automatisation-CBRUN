import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { createRecord, humanRef, TABLES } from './_lib/airtable.js'
import { optionalString, requireNumber, requireString, ValidationError, withPost } from './_lib/handler.js'

export default withPost(async (req: ApiRequest, res: ApiResponse) => {
  const body = (req.body || {}) as Record<string, unknown>

  const type = requireString(body, 'type')
  if (type !== 'Cadeau' && type !== 'Perte') {
    throw new ValidationError('Le type de sortie doit être "Cadeau" ou "Perte".')
  }

  const fields: Record<string, unknown> = {
    'Référence Ligne': humanRef(type === 'Cadeau' ? 'CAD' : 'PRT'),
    'Référence Vendue': [requireString(body, 'varianteId')],
    Quantité: requireNumber(body, 'quantite'),
    'Type Mouvement': type,
    'Date Mouvement (hors facture)': requireString(body, 'date'),
  }

  const beneficiaire = optionalString(body, 'beneficiaire')
  if (beneficiaire) fields['Bénéficiaire (hors facture)'] = beneficiaire

  if (type === 'Cadeau') {
    const motif = requireString(body, 'motif')
    fields['Motif Cadeau'] = motif
  } else {
    // Pas de champ dédié au motif de perte dans Airtable : on le consigne en note libre.
    const notes = optionalString(body, 'notes')
    fields['Notes'] = notes ? notes : 'Perte / casse constatée'
  }

  const record = await createRecord(TABLES.lignesDeVente, fields)
  res.status(201).json({ id: record.id })
})
