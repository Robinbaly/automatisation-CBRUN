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

## find-skills

- Source : https://github.com/vercel-labs/skills (dossier `skills/find-skills`)
- Licence : MIT
- Rôle : aide à chercher et installer des skills existants dans l'écosystème
  ouvert (skills.sh) avant de coder une solution maison.
- Récupéré le 01/09/2026.

## accessibility, seo, performance, core-web-vitals, web-quality-audit, best-practices

- Source : https://github.com/addyosmani/web-quality-skills (dossier `skills/<nom>`)
- Licence : MIT
- Rôle : audit qualité web basé sur Lighthouse/Core Web Vitals — accessibilité
  WCAG 2.2, référencement, performance réelle, bonnes pratiques générales.
  Utile pour la conformité RGAA et le SEO du site e-commerce.
- Récupéré le 01/09/2026.

## copywriting, cro

- Source : https://github.com/coreyhaines31/marketingskills (dossier `skills/<nom>`,
  2 skills sur les 32 du dépôt — les autres n'ont pas été retenus)
- Licence : MIT
- Rôle : rédaction de fiches produit orientée conversion (copywriting) et
  optimisation du tunnel d'achat panier/paiement (cro).
- Récupéré le 01/09/2026.

## Outils installés comme plugins (pas vendorés ici)

Superpowers, ClaudeMem et les plugins officiels Anthropic (Stripe, Vercel,
Resend, Shippo, security-guidance, Semgrep, LegalZoom, PostHog, Cloudinary)
ne sont pas des
dossiers `.claude/skills/` : ce sont des plugins déclarés dans
`.claude/settings.json` (`enabledPlugins` + `extraKnownMarketplaces`), en
scope projet. Claude Code les récupère automatiquement depuis leur
marketplace GitHub à l'ouverture du dépôt — pas de vendoring nécessaire, mais
ça suppose un accès réseau à GitHub en début de session.

## Mise à jour

Ces skills évoluent côté auteur d'origine. Pour les rafraîchir, reclonez le
dépôt source et remplacez le dossier correspondant ici (`.claude/skills/<nom>/`).
