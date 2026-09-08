---
name: pitch-deck-cbrun
description: Use when preparing a commercial slide presentation / pitch deck for a CBRUN automation client proposal — packs "automatisation stock", "traitement facture fournisseur (email/scan/photo)", "interface de pilotage" multi-rôle (patron/responsable/employé), or pack RH (pointage, planning, congés, déclarations, fiche de paie). Trigger on French phrases like "présentation client", "pitch deck", "proposition commerciale", "présentation d'accompagnement", "slide pour le client", "deck automatisation IA", or when the user names a prospect/client and wants a sales presentation of CBRUN's automation packs. Not for generic non-sales presentations — for those, use the pptx or design skill directly.
metadata:
  version: 1.0.0
---

# Pitch deck CBRUN — packs automatisation

Construit une présentation commerciale structurée pour vendre les packs
d'automatisation CBRUN (stock, facturation fournisseur, pilotage, RH) à un
client donné. Ce skill couvre le **contenu** (structure du pitch) et le
**design** (règles visuelles) ; le format de sortie (fichier, outil) se
choisit au moment de la demande — voir "Router la sortie" plus bas.

## Avant de construire

Rassemble ce qui manque avant de rédiger (demande si absent) :

1. **Client** : nom, secteur, taille, contexte (ce qu'il fait manuellement
   aujourd'hui, sa douleur principale).
2. **Packs concernés** : lesquels parmi stock / facturation / pilotage / RH
   — ne pas tout mettre par défaut, adapter à ce que le client a demandé.
3. **Chiffres si disponibles** : volume de factures/mois, effectif, temps
   actuellement passé sur les tâches manuelles — sert aux slides ROI. À
   défaut, rester qualitatif plutôt qu'inventer des chiffres.
4. **Format de sortie voulu** : pptx / Canva / artifact HTML / à décider
   ensemble — voir "Router la sortie".

## Structure du pitch

Voir `references/structure-offre-automatisation.md` pour le déroulé de
slides recommandé (accroche → constat → packs détaillés → ROI →
accompagnement → tarif → next steps), avec le contenu type de chaque pack.
Adapter l'ordre et retirer les packs non concernés — ne pas forcer un plan
générique sur un besoin ciblé.

## Règles de design

Voir `references/design.md` pour les règles de mise en page à appliquer
(une idée par slide, hiérarchie visuelle, palette par défaut, avant/après,
mockups d'interface plutôt que texte pour illustrer le pilotage). Charger
aussi le skill `dataviz` avant de construire un graphique ROI ou une
comparaison avant/après chiffrée.

## Router la sortie

Ce skill ne génère pas de fichier lui-même — il pilote un des trois skills/
outils suivants selon le format choisi :

- **PowerPoint (.pptx)** → utiliser le skill `pptx`. Lui donner le plan de
  `references/structure-offre-automatisation.md` déjà adapté au client,
  et les règles de `references/design.md` comme contraintes visuelles.
- **Canva (template de marque)** → utiliser le connecteur MCP Canva
  (`search-brand-templates`, `generate-design-structured`,
  `export-design`). Chercher d'abord un brand template existant avant
  d'en générer un depuis zéro.
- **Artifact HTML interactif** → charger le skill `design` (canvas
  d'artboards) ou `artifact-design` pour une présentation web navigable,
  utile pour une démo live ou une itération rapide avant export pptx/PDF.

Si le format n'est pas précisé, proposer l'artifact HTML par défaut
(itération rapide, pas de dépendance externe) puis offrir l'export
pptx/Canva une fois le contenu validé par le client interne (CBRUN) avant
envoi au prospect.
