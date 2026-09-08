# Règles de design — pitch deck CBRUN

## Principes généraux

- **Une idée par slide.** Si une slide a besoin de deux titres, c'est deux
  slides.
- **Peu de texte** : viser ~40 mots max par slide hors titre. Le texte
  d'appui se dit à l'oral, pas lu sur l'écran.
- **Hiérarchie visuelle claire** : un titre net, un élément visuel
  dominant (schéma, mockup, chiffre clé), le reste en support.
- **Avant/après** pour tout ce qui touche à l'automatisation : montrer le
  flux manuel actuel barré/simplifié à côté du flux automatisé, plutôt que
  décrire en texte.
- **Mockups d'interface plutôt que texte** pour la slide "pilotage" —
  un aperçu (même simplifié) du dashboard patron/responsable/employé est
  plus convaincant qu'une liste de fonctionnalités.
- **Cohérence** : même grille, mêmes espacements, même style d'icônes sur
  tout le deck. Ne pas changer de style visuel entre les packs.

## Palette par défaut (pas d'identité de marque fournie)

Palette professionnelle sobre orientée tech/automatisation, à utiliser tant
qu'aucune charte CBRUN ou client n'est fournie :

- Fond clair : `#F8FAFC`
- Fond sombre / slides de rupture (titre, CTA) : `#0F172A`
- Couleur primaire (accents, titres, liens) : `#2563EB` (bleu)
- Couleur secondaire (succès, gains, ROI positif) : `#16A34A` (vert)
- Couleur d'alerte (points de douleur "avant") : `#DC2626` (rouge), usage
  ponctuel uniquement — pas de slide entière en rouge.
- Texte principal : `#0F172A` sur fond clair, `#F8FAFC` sur fond sombre.
- Texte secondaire/légendes : `#64748B`.

Typographie : une police sans-serif géométrique/professionnelle (ex.
Inter, Söhne, ou équivalent système comme -apple-system/Segoe UI selon le
support), un seul poids "bold" pour les titres, "regular" pour le texte.

Si le client ou CBRUN fournit un logo/charte, cette palette est remplacée
par la charte fournie — ne pas mélanger les deux.

## Charger dataviz pour les graphiques

Avant de construire tout graphique (ROI, comparaison de volumes, gains de
temps), charger le skill `dataviz` : il donne la méthode de choix de forme
de graphique et une palette validée pour les séries de données, cohérente
avec un rendu clair en clair/sombre.
