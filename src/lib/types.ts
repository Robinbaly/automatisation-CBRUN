export type StockThreshold = {
  actuel: number
  seuil: number
  statut: string
}

export type VracItem = {
  id: string
  nom: string
  categorie: string
  statutGlobal: string
  stockActuel: number
  seuilCritique: number
  statut: string
}

export type VarianteItem = {
  id: string
  libelle: string
  statut: string
  produitMaitreId?: string
  produitMaitreNom?: string
  grammage: number
  sachets: StockThreshold
  sachetsVierges: StockThreshold
  etiquette1: StockThreshold
  etiquette2: StockThreshold
  etiquetteVerso: StockThreshold
}

export type KraftItem = {
  id: string
  format: string
  stockActuel: number
  seuilCritique: number
  statut: string
}

export type StockData = {
  vrac: VracItem[]
  variantes: VarianteItem[]
  kraft: KraftItem[]
}
