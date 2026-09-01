# CLAUDE.md — Contexte projet automatisation-CBRUN

Ce fichier donne à Claude Code (et aux autres agents travaillant sur ce dépôt) le
contexte de l'environnement de travail. Il est versionné ici car il concerne le
setup technique ; la documentation métier (cahiers des charges, handoffs) vit
dans le dossier Google Drive « Automatisation IA », pas ici.

## Machine

MSI GS60 6QE Ghost Pro (i7-6700HQ, GTX 970M). Windows 10 réinstallé proprement
le 25/08/2026 (option « Ne rien conserver », après l'échec de plusieurs
tentatives de mise à niveau vers 22H2). Pilotes Intel Graphics + NVIDIA
GeForce GTX 970M réinstallés et fonctionnels.

L'ancien disque D: (600 Go libres) est conservé comme sauvegarde de l'ancienne
installation — il contient les données de l'ancien logiciel de facturation
Sage 50 Ciel, pas encore récupérées.

## Dossier de travail local

```
C:\Users\cbrun\OneDrive\Documents\automatisation-CBRUN
```

⚠️ Ce dossier est sous `OneDrive\Documents`, pas juste `Documents` — il
apparaît dans l'explorateur sous le raccourci « Documents » car OneDrive
redirige ce dossier connu, mais en ligne de commande il faut bien passer par
`OneDrive`.

- Synchronisé automatiquement via OneDrive
- Relié à ce dépôt : `https://github.com/Robinbaly/automatisation-CBRUN.git`
  (branche `main`)
- C'est ici que tournent Claude Code, Codex et (une fois réparé) Prime Agent

## Outils installés sur cette machine

- Claude Code (CLI + app desktop), connecté au compte Claude Pro
- Codex CLI (OpenAI), connecté au compte ChatGPT
- Git 2.55
- Node.js v24.19.0
- Python 3.14.7 (installé via python.org le 27/08/2026 — ne pas confondre
  avec l'ancien faux raccourci Microsoft Store `WindowsApps\python.exe`,
  toujours présent mais à ignorer)
- Prime Agent (Prime Intellect) — installé mais cassé en mode interactif
  natif Windows (bug upstream confirmé, non corrigé, voir
  `docs/troubleshooting/prime-agent-windows.md`). À réinstaller sous WSL.
- MCP connectés dans Claude Code : Firecrawl, Playwright (scope local),
  Airtable, Canva, Dropbox, Gmail, Google Drive, Jotform, Make (via claude.ai)

## Sources de référence sur le projet CBRUN

- **Google Drive** : dossier « Automatisation IA » — documents de handoff et
  cahiers des charges de chaque automatisation. Structure fusionnée à partir
  des anciens dossiers « ERP CBRUN » et « base de donne CBRUN ».
- **Airtable** : base « CBRUN - Référentiel Produits » (tables
  Catalogue_Produits et Variantes), en cours d'évolution vers un ERP complet
  (module clients/ventes, gestion de stock).
- **Dropbox** : factures fournisseurs et documents d'achats.
- **Google Sheet** : « Référentiel Produits CBRUN » (ancienne structure, en
  cours de bascule vers Airtable).

## Règle de travail

Toute automatisation ou script produit doit être versionné dans ce dépôt Git.
Le dossier Drive « Automatisation IA » reste la documentation humaine
(cahiers des charges, handoffs) — le code lui-même vit ici, pas sur Drive.
