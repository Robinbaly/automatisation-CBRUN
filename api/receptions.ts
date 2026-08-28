import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { createRecord, humanRef, TABLES } from './_lib/airtable.js'
import { optionalString, requireNumber, requireString, ValidationError, withPost } from './_lib/handler.js'

const TYPES_ACHAT = ['Vrac CBD', 'Sachets kraft', 'Étiquette 1 (Haut)', 'Étiquette 2 (Bas)', 'Étiquette Verso (AR)', 'Autre'] as const

export default withPost(async (req: ApiRequest, res: ApiResponse) => {
  const body = (req.body || {}) as Record<string, unknown>

  const typeAchat = requireString(body, 'typeAchat')
  if (!TYPES_ACHAT.includes(typeAchat as (typeof TYPES_ACHAT)[number])) {
    throw new ValidationError(`Type d'achat inconnu : "${typeAchat}".`)
  }
  const date = requireString(body, 'date')

  const fields: Record<string, unknown> = {
    'Référence Réception': humanRef('REC'),
    "Type d'Achat": typeAchat,
    'Date Réception': date,
  }

  const fournisseur = optionalString(body, 'fournisseur')
  if (fournisseur) fields['Fournisseur'] = fournisseur
  const referenceFacture = optionalString(body, 'referenceFacture')
  if (referenceFacture) fields['Référence Facture'] = referenceFacture
  const notes = optionalString(body, 'notes')
  if (notes) fields['Notes'] = notes

  if (typeAchat === 'Vrac CBD') {
    fields['Produit (Vrac)'] = [requireString(body, 'produitVracId')]
    fields['Quantité Reçue (g)'] = requireNumber(body, 'quantiteG')
  } else if (typeAchat === 'Sachets kraft') {
    fields['Format Kraft Reçu'] = [requireString(body, 'formatKraftId')]
    fields['Quantité Reçue (unités)'] = requireNumber(body, 'quantiteUnites')
  } else if (typeAchat.startsWith('Étiquette')) {
    fields['Variante Concernée (étiquettes)'] = [requireString(body, 'varianteId')]
    fields['Quantité Reçue (unités)'] = requireNumber(body, 'quantiteUnites')
  }
  // "Autre" : seulement les champs communs (fournisseur, notes, date) ; pas de lien de stock.

  const record = await createRecord(TABLES.receptionsFournisseur, fields)
  res.status(201).json({ id: record.id })
})
