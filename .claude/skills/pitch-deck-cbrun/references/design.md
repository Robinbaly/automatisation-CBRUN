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

## Palette CBRUN réelle (identité de marque — priorité par défaut)

Ce dépôt contient l'appli réelle CB-RUN Stock (`src/index.css`,
`src/components/Layout.tsx`) : c'est l'identité de marque CBRUN, pas une
supposition. Un pitch deck CBRUN doit partir de cette palette par défaut
— pas d'une palette générique tech bleu/vert inventée sans contexte :

- Fond clair (crème, pas blanc pur) : `#FAF6F3`
- Surface carte : `#FFFFFF` — surface alternative (bandeaux, cellules) :
  `#FBEFEC`
- Texte principal (brun-noir chaud, pas noir pur) : `#241715`
- Texte secondaire/légendes : `#8A7570`
- Bordures : `#ECDFDB`
- Couleur primaire / accent d'action (nav, CTA, titres de rupture) :
  `#A81330` (rouge) — variante appuyée pour fonds pleins (sidebar, slide
  de titre/CTA) : `#6F0C21`
- Succès / OK / gains : `#1F7A4D` (vert — c'est aussi la couleur du
  logo CBD RUN, `public/logo-192.png`)
- Avertissement : `#A6660A`
- Critique/alerte : `#C81E3A`, usage ponctuel uniquement — pas de slide
  entière dans cette couleur.

Typographie (identique à l'appli, chargée depuis Google Fonts) :
- Titres/display : **Fraunces** (serif, poids 500–700)
- Texte courant : **IBM Plex Sans**
- Données/labels/nombres (tabular-nums) : **IBM Plex Mono**

Le logo CBRUN (`public/logo-192.png`, hexagone vert avec feuille) est
disponible dans ce dépôt et peut être embarqué en base64 dans un artifact
HTML ou une slide pptx.

**Cette palette est le défaut pour tout pitch CBRUN**, y compris pour un
client externe (ex. CBD Jaffar) — c'est l'identité de l'entreprise qui
vend l'offre, pas celle du client. Ne la remplacer que si CBRUN fournit
explicitement une nouvelle charte, ou si le client demande que le deck
porte sa propre identité visuelle plutôt que celle de CBRUN.

## Charger dataviz pour les graphiques

Avant de construire tout graphique (ROI, comparaison de volumes, gains de
temps), charger le skill `dataviz` : il donne la méthode de choix de forme
de graphique et une palette validée pour les séries de données, cohérente
avec un rendu clair en clair/sombre.
