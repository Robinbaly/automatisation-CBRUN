# CB-RUN Stock

Interface de pilotage du stock CB-RUN Distribution, connectée en temps réel à la base Airtable **CBRUN - ERP**.

Flux couvert : **vrac → sachets vierges étiquetés → sachets prêts à la vente**, plus les sorties hors vente (cadeau / perte).

## Comment ça marche

- Le frontend (React + Tailwind) n'appelle jamais Airtable directement.
- Il appelle des fonctions serveur (`/api/*`, déployées comme fonctions Vercel) qui, elles, parlent à l'API Airtable avec une clé secrète (`AIRTABLE_TOKEN`) qui ne quitte jamais le serveur.
- Tous les stocks "actuels" affichés (vrac, sachets, kraft, étiquettes) sont des **formules Airtable** : l'appli ne fait qu'ajouter une ligne dans la bonne table d'opération (réception, empaquetage, étiquetage, ligne de vente), et Airtable recalcule tout seul.
- Un écran de connexion protège l'accès par un mot de passe unique (l'appli a un accès en écriture à toute la base).

## Avant de déployer — une manip à faire dans Airtable

Le champ **Type Mouvement** de la table **Lignes de Vente** n'a pas d'option "Perte" par défaut. Pour que la page **Cadeau / Perte** fonctionne pour les pertes :

1. Ouvre la table `Lignes de Vente` dans Airtable.
2. Clique sur l'en-tête du champ `Type Mouvement` → *Edit field*.
3. Ajoute une option **`Perte`**.

(La partie "Cadeau" fonctionne sans rien changer, l'option existe déjà.)

## Configuration

Copie `.env.example` vers `.env` en local, ou renseigne ces variables dans les paramètres du projet Vercel :

| Variable | Description |
|---|---|
| `AIRTABLE_TOKEN` | Personal Access Token Airtable, scopé sur la base "CBRUN - ERP" avec les droits `data.records:read`, `data.records:write`, `schema.bases:read`. À créer sur [airtable.com/create/tokens](https://airtable.com/create/tokens). |
| `AIRTABLE_BASE_ID` | Optionnel. Par défaut pointe déjà sur la base "CBRUN - ERP" (`appxDtzVHHtBR8qnD`). |
| `APP_PASSWORD` | Le mot de passe unique de connexion à l'appli. Choisis-en un solide. |

**Ne mets jamais `AIRTABLE_TOKEN` dans le code ou dans un fichier commité** : uniquement dans les variables d'environnement Vercel (ou un `.env` local, qui est ignoré par git).

## Déploiement (Vercel — accessible depuis PC, tablette, téléphone)

1. Pousse ce dépôt sur GitHub (déjà fait si tu lis ce README depuis la branche de la PR).
2. Sur [vercel.com](https://vercel.com), *Add New → Project*, importe ce dépôt.
3. Dans *Environment Variables*, ajoute `AIRTABLE_TOKEN` et `APP_PASSWORD` (voir tableau ci-dessus).
4. Déploie. Vercel détecte automatiquement Vite pour le frontend et les fichiers du dossier `api/` comme fonctions serveur.
5. Ouvre l'URL fournie par Vercel depuis ton téléphone ou ta tablette, puis utilise **"Ajouter à l'écran d'accueil"** (Safari/Chrome) pour l'installer comme une app.

## Développement local

```bash
npm install
npm run dev        # frontend seul, sur http://localhost:5173

# Pour tester aussi les fonctions /api, utilise la CLI Vercel :
npm i -g vercel
vercel dev          # sert le frontend + les fonctions api/ ensemble
```

## Structure

```
src/                 Frontend React (pages, composants, appels à /api)
api/                 Fonctions serveur (proxy Airtable, auth par mot de passe)
api/_lib/airtable.ts Constantes des tables Airtable + wrapper fetch avec gestion d'erreur
api/_lib/auth.ts     Cookie de session signé (HMAC dérivé de APP_PASSWORD)
```

## Gestion d'erreur

Si un champ envoyé ne correspond pas à ce qu'Airtable attend (champ renommé, option de liste supprimée, etc.), l'API Airtable renvoie une erreur explicite qui est directement affichée dans un bandeau rouge sur le formulaire concerné — l'appli ne plante pas silencieusement.

## Limites connues

- L'écriture Airtable n'a pas pu être testée en conditions réelles pendant le développement (pas de token Airtable disponible pour l'appli à ce stade) : la logique de mapping des champs a été vérifiée à partir du schéma réel de la base, et la logique serveur (auth, validation, gestion d'erreur) a été testée unitairement, mais un premier essai réel après déploiement est recommandé avant un usage quotidien.
- Pas de mode hors-ligne : une connexion internet est nécessaire (Airtable est appelé à chaque chargement et à chaque saisie).
