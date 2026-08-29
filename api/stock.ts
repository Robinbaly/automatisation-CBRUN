import type { ApiRequest, ApiResponse } from './_lib/http-types.js'
import { requireAuth } from './_lib/auth.js'
import { AirtableError, TABLES, listRecords } from './_lib/airtable.js'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}
function num(v: unknown): number {
  return typeof v === 'number' ? v : 0
}
function firstLinked(v: unknown): string | undefined {
  return Array.isArray(v) && typeof v[0] === 'string' ? v[0] : undefined
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireAuth(req, res)) return

  try {
    const [vracRecords, varianteRecords, kraftRecords] = await Promise.all([
      listRecords(TABLES.catalogueProduits, {
        fields: ['Produit maître', 'Catégorie', 'Statut global', 'Stock Vrac Actuel (g)', 'Seuil Critique Vrac (g)', 'Statut Stock Vrac'],
        sort: [{ field: 'Produit maître' }],
      }),
      listRecords(TABLES.variantes, {
        fields: [
          'Libellé',
          'Produit maître',
          'Catégorie',
          'Statut',
          'Grammage (g)',
          'Stock Sachets Actuel',
          'Seuil Critique Sachets',
          'Statut Stock Sachets',
          'Stock Sachets Vierges Étiquetés',
          'Seuil Critique Sachets Vierges Étiquetés',
          'Statut Sachets Vierges',
          'Stock Étiquette 1 (Haut)',
          'Seuil Critique Étiquette 1 (Haut)',
          'Statut Étiquette 1',
          'Stock Étiquette 2 (Bas)',
          'Seuil Critique Étiquette 2 (Bas)',
          'Statut Étiquette 2',
          'Stock Étiquettes Verso (AR)',
          'Seuil Critique Étiquettes Verso (AR)',
          'Statut Étiquette Verso',
        ],
        sort: [{ field: 'Libellé' }],
      }),
      listRecords(TABLES.stockEmballageVierge, {
        fields: ['Format Emballage', 'Stock Kraft Actuel', 'Seuil Critique', 'Statut Stock'],
      }),
    ])

    const vracNameById = new Map(vracRecords.map((r) => [r.id, str(r.fields['Produit maître'])]))

    const vrac = vracRecords.map((r) => ({
      id: r.id,
      nom: str(r.fields['Produit maître']),
      categorie: str((r.fields['Catégorie'] as { name?: string })?.name),
      statutGlobal: str((r.fields['Statut global'] as { name?: string })?.name),
      stockActuel: num(r.fields['Stock Vrac Actuel (g)']),
      seuilCritique: num(r.fields['Seuil Critique Vrac (g)']),
      statut: str(r.fields['Statut Stock Vrac']),
    }))

    const variantes = varianteRecords.map((r) => {
      const produitMaitreId = firstLinked(r.fields['Produit maître'])
      return {
        id: r.id,
        libelle: str(r.fields['Libellé']),
        categorie: str((r.fields['Catégorie'] as { name?: string })?.name),
        statut: str((r.fields['Statut'] as { name?: string })?.name),
        produitMaitreId,
        produitMaitreNom: produitMaitreId ? vracNameById.get(produitMaitreId) : undefined,
        grammage: num(r.fields['Grammage (g)']),
        sachets: {
          actuel: num(r.fields['Stock Sachets Actuel']),
          seuil: num(r.fields['Seuil Critique Sachets']),
          statut: str(r.fields['Statut Stock Sachets']),
        },
        sachetsVierges: {
          actuel: num(r.fields['Stock Sachets Vierges Étiquetés']),
          seuil: num(r.fields['Seuil Critique Sachets Vierges Étiquetés']),
          statut: str(r.fields['Statut Sachets Vierges']),
        },
        etiquette1: {
          actuel: num(r.fields['Stock Étiquette 1 (Haut)']),
          seuil: num(r.fields['Seuil Critique Étiquette 1 (Haut)']),
          statut: str(r.fields['Statut Étiquette 1']),
        },
        etiquette2: {
          actuel: num(r.fields['Stock Étiquette 2 (Bas)']),
          seuil: num(r.fields['Seuil Critique Étiquette 2 (Bas)']),
          statut: str(r.fields['Statut Étiquette 2']),
        },
        etiquetteVerso: {
          actuel: num(r.fields['Stock Étiquettes Verso (AR)']),
          seuil: num(r.fields['Seuil Critique Étiquettes Verso (AR)']),
          statut: str(r.fields['Statut Étiquette Verso']),
        },
      }
    })

    const kraft = kraftRecords.map((r) => ({
      id: r.id,
      format: str(r.fields['Format Emballage']),
      stockActuel: num(r.fields['Stock Kraft Actuel']),
      seuilCritique: num(r.fields['Seuil Critique']),
      statut: str(r.fields['Statut Stock']),
    }))

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ vrac, variantes, kraft })
  } catch (err) {
    if (err instanceof AirtableError) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message })
      return
    }
    res.status(500).json({ error: 'Erreur inattendue côté serveur.' })
  }
}
