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
- Prime Agent (Prime Intellect) — cassé en natif Windows (bug upstream
  confirmé, non corrigé), **résolu via WSL** (Ubuntu) le 01/09/2026, voir
  `docs/troubleshooting/prime-agent-windows.md`. Installé sous WSL,
  lancer avec `prime-agent` depuis un terminal Ubuntu, dossier de travail
  accessible via `/mnt/c/Users/cbrun/OneDrive/Documents/automatisation-CBRUN`.
- MCP connectés dans Claude Code : Firecrawl, Playwright (scope local),
  Airtable, Canva, Dropbox, Gmail, Google Drive, Jotform, Make (via claude.ai)
- MCP connectés dans Codex CLI (vérifié le 01/09/2026, parité complète avec
  Claude Code atteinte) : `codex_apps` (Airtable/Canva/Dropbox/Gmail/Google
  Drive, 203 outils), `firecrawl` (3 outils), `jotform` (13 outils), `make`
  (115 outils), `playwright` (24 outils). Ajoutés via
  `codex mcp add <nom> --url <url>` (serveurs distants HTTP, autorisation
  OAuth déclenchée automatiquement) et `codex mcp add playwright -- npx
  @playwright/mcp@latest` (serveur local). URLs exactes dans l'historique
  Git si besoin de reproduire ailleurs.

## Répartition des tâches entre Claude Code et Codex

Logique issue du cahier des charges Drive « Cahier des charges - Répartition
Claude Code, Codex, Prime Agent » (28/08/2026), **version sans Prime Agent**
(mis de côté le 01/09/2026 faute de budget Prime Inference — à réintégrer
plus tard si budget alloué, voir `docs/troubleshooting/prime-agent-windows.md`).

**Principe** : Claude Code est le point d'entrée unique et le coordinateur.
Il ne s'agit pas d'un aiguillage exclusif (toute la tâche part vers un seul
outil) mais d'une vraie répartition : Claude Code découpe la demande en
sous-tâches et distribue entre Claude et Codex, avec possibilité de travail
en parallèle sur différents morceaux d'une même demande.

**Niveau 1 — répartition Claude / Codex**, selon la nature du sujet :
- Reste avec Claude Code : compréhension de la demande, conception/
  architecture, communication avec l'utilisateur, décisions métier CBRUN,
  tâches courtes.
- Part vers Codex : génération de code volumineuse ou répétitive,
  refactoring étendu, exécution de tests/scripts longs, tâches qui peuvent
  tourner en parallèle sans supervision constante.
- Objectif : équilibrer la charge entre le compte Claude Pro et le compte
  OpenAI pour économiser les tokens Claude et permettre des sessions plus
  longues.

**Mécanisme technique** : Claude Code invoque Codex en sous-commande, mode
headless officiel :
```bash
codex exec "description précise de la sous-tâche" --sandbox workspace-write
```
(`--sandbox read-only` pour une tâche d'analyse seule). La sortie est
récupérée et intégrée directement à la réponse de Claude Code — fonctionne
nativement sur Windows, pas de bug TTY comme sur Prime Agent.

**Niveau 2 — calibrage automatique du modèle** à l'intérieur de chaque
outil, selon la difficulté réelle de la sous-tâche : modèle léger/rapide
pour du simple, modèle le plus capable pour du complexe ou du raisonnement
poussé. Côté Claude via sélection de modèle ; côté Codex via le flag
`--model` de `codex exec` (modèle disponible à préciser selon le compte
ChatGPT — `gpt-5.6-sol` observé par défaut au 01/09/2026).

**Contrainte de fond** : une seule logique globale et automatique, appliquée
par Claude Code à chaque question, pas de règles séparées au cas par cas
par sujet.

**Reste à affiner** (points ouverts du cahier des charges original) :
- Critères précis pour distinguer tâche "simple" vs "réflexion poussée"
  (niveau 2).
- Test de comparaison prévu à l'origine avec Prime Agent (mis en pause).

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
