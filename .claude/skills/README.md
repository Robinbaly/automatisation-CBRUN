# Compétences Claude Code versionnées dans ce dépôt

Ces dossiers sont des compétences (« skills ») tierces, embarquées telles
quelles depuis leurs dépôts sources pour que Claude Code (cloud ou en local
sur le MSI) en dispose automatiquement dans ce projet, sans réinstallation
manuelle à chaque session.

## impeccable

- Source : https://github.com/pbakaus/impeccable
- Licence : Apache 2.0
- Rôle : critique/audit/polish de design frontend (23 commandes, 61 règles
  de détection d'anti-patterns).
- Récupéré le 01/09/2026.

## ui-ux-pro-max

- Source : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Licence : MIT
- Rôle : base de données consultable de guidance UI/UX (styles, palettes,
  polices, règles UX, stacks techniques).
- Récupéré le 01/09/2026. Le sous-dossier `scripts/tests/` du dépôt source
  (tests unitaires internes à l'outil, pas utilisés par le skill lui-même)
  a été retiré pour ne garder que ce qui sert réellement à l'exécution.

## Mise à jour

Ces skills évoluent côté auteur d'origine. Pour les rafraîchir, reclonez le
dépôt source et remplacez le dossier correspondant ici (`.claude/skills/<nom>/`).
