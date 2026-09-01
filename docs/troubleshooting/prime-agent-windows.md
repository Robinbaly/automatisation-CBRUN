# Prime Agent bloque au démarrage sur Windows (MSI)

Statut : **non résolu, mais cause probable identifiée + contournement à tester**.
Ouvert le : 27/08/2026. Dernière mise à jour : 28/08/2026.

## Contexte

Installation de Prime Agent (Prime Intellect) réalisée le 27/08/2026 via Git
Bash, dans `C:\Users\cbrun\OneDrive\Documents\automatisation-CBRUN`.
L'installation elle-même a réussi (`Prime Agent v0.8.1 installed globally`),
mais l'outil ne parvient jamais à démarrer correctement.

## Symptôme exact

À chaque lancement de `prime-agent` (en Git Bash), le worker démarre bien et
se met à écouter sur son pipe nommé (confirmé dans les logs), mais le
superviseur n'arrive jamais à s'y connecter et time-out après 30 secondes sur
l'étape `worker_auth`. Erreur systématique :

```
Error: Timed out after 30000ms waiting for the Prime Agent daemon response to "create".
Socket: \\.\pipe\prime-agent-daemon.
Daemon log: C:\Users\cbrun\.prime\agent\logs\prime-agent-daemon.<id>.log
    at Timeout._onTimeout (.../prime-agent/dist/bundle/chunk-OKDNBPEN.js:12359:22)
```

Dans le log daemon, la ligne clé qui revient à chaque tentative :

```
supervisor: Supervisor command create failed: Error: Timed out connecting to daemon session worker:
Error: Timed out waiting for daemon worker response to worker_auth
```

Le fichier de log du worker lui-même (`prime-agent-worker-<id>.log`) ne
contient qu'une seule ligne : confirmation qu'il écoute sur son pipe, puis
rien — il ne va jamais plus loin, pas d'erreur explicite de son côté.

## Environnement

- OS : Windows (build via PowerShell/Git Bash MINGW64)
- Node.js v24.19.0
- Prime Agent v0.8.1 (installé globalement via npm)
- Python 3.14.7
- Dossier de travail : `C:\Users\cbrun\OneDrive\Documents\automatisation-CBRUN`
  (dépôt Git relié à GitHub, synchronisé OneDrive)

## Pistes testées et écartées

1. **Python absent/mal configuré** → corrigé : Python 3.14.7 installé
   proprement via python.org (le seul Python présent avant était un faux
   raccourci Microsoft Store). Variable d'environnement
   `PRIME_AGENT_KERNEL_PYTHON` configurée vers
   `C:\Users\cbrun\AppData\Local\Python\pythoncore-3.14-64\python.exe`. Le
   problème persiste malgré ça.
2. **Conflit de synchronisation OneDrive** → écarté : même échec exact en
   testant dans un dossier 100% local hors OneDrive (`~/prime-test`).
3. **Windows Defender bloquant les named pipes** → exclusions ajoutées
   (`C:\Program Files\nodejs`, `%APPDATA%\npm`, `node.exe`) + protection
   temps réel désactivée entièrement (`Set-MpPreference
   -DisableRealtimeMonitoring $true`). Même échec avec Defender désactivé.
4. **Daemon fantôme / état corrompu** → nettoyé plusieurs fois
   (`Stop-Process` sur les `node.exe` liés à `prime-agent --mode daemon`,
   `prime-agent shutdown --force`, `prime-agent doctor --fix` — rapportent
   tous deux un environnement propre). Le problème revient identique à
   chaque tentative.
5. **Tester hors Git Bash (vraie console Win32)** → écarté : lancé dans une
   vraie fenêtre PowerShell (pas MinTTY), même timeout `worker_auth` après
   30s, identique en tout point.

## Diagnostic du 28/08/2026 — sondage pipe, EDR/GPO, installs concurrentes

### 1. Le pipe existe et fonctionne — ce n'est pas un bug de nommage

Sondé pendant que le worker tourne et attend (`Test-Path`,
`[System.IO.Directory]::GetFiles("\\.\pipe\")`) : le pipe superviseur
`\\.\pipe\prime-agent-daemon` **existe bel et bien**, et le pipe de session
spécifique au worker (`\\.\pipe\prime-agent-worker-<daemonid>-<workerid>`)
aussi. Confirmé dans `prime-agent-daemon.<id>.log` : `Session worker <id>
stderr: Prime Agent daemon listening on \\.\pipe\prime-agent-worker-...`.

Plus fort : en lançant `prime-agent` **hors TTY** (via `Start-Process`
PowerShell avec sortie redirigée vers un fichier, donc sans console
attachée), le cycle complet fonctionne parfaitement — le worker écoute, reçoit
une commande via le pipe, et s'arrête proprement (`shutdown command received
over socket` / `shutting down (exit 0)`) en ~2 secondes. **Aucun timeout
`worker_auth` dans ce mode.**

→ Conclusion : le mécanisme de named pipe lui-même n'est pas bloqué (ni par
Defender, ni par un nommage incohérent, ni par autre chose). Le bug est
spécifique aux sessions **avec un vrai TTY attaché** (console interactive),
puisque c'est le seul cas où il a été reproduit (Git Bash/MinTTY *et*
PowerShell natif, mais pas en headless).

### 2. Piste dans le code du CLI (bundle minifié, lecture de
   `chunk-ZRIBV47F.js`)

Le CLI choisit son mode d'exécution ainsi (`resolveAppMode`) :
```js
if (parsed.print || !stdinIsTTY) return "print";
return "interactive";
```
Autrement dit, dès que `process.stdin.isTTY === true` et qu'aucun flag
`--print`/`-p` n'est passé, le CLI bascule dans le mode **`interactive`**
(TUI plein écran, `process.stdout.isTTY === true` → `fullscreenEnabled`).
C'est un chemin de code entièrement différent de celui emprunté en mode
`print`/headless — celui qui, empiriquement, fonctionne.

Le handshake `worker_auth` lui-même (`assertDaemonSupervisorOwnerCurrent`
dans le même bundle) ne fait que de la lecture de fichier synchrone
(`owner.json` dans `~/.prime/supervisor-owners/`) et un `process.kill(pid,
0)` pour vérifier qu'un process est vivant — aucun appel réseau, aucun
`wmic`/`tasklist`/`Get-Process` externe qui pourrait traîner. Donc la
logique d'auth en elle-même n'est probablement pas la cause du délai — le
blocage semble plutôt se produire **avant** que la requête `worker_auth` ne
soit seulement émise, quelque part dans l'initialisation du mode TUI
interactif (détection de taille de terminal, event loop pris par le
rendu, etc.). Non confirmé avec certitude faute de pouvoir attacher un vrai
TTY depuis les outils d'agent utilisés pour ce diagnostic.

### 3. EDR tiers / GPO d'entreprise → écarté, machine non managée

```
Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct
  → seul "Windows Defender" enregistré
Get-Service (Sophos|CrowdStrike|Cortex|SentinelOne|Bitdefender|Norton|...)
  → aucun résultat
Get-Service -Name intunemanagementextension → absent
Get-CimInstance Win32_ComputerSystem → Domain=WORKGROUP, PartOfDomain=False
Get-AppLockerPolicy → cmdlet absente (Windows 10 Home, pas de fonctionnalité AppLocker)
Get-MpPreference → AttackSurfaceReductionRules_Ids vide, ASR inactif
```
Machine 100% personnelle, non domain-joined, non MDM-enrolled, aucun EDR
tiers. Cette piste est définitivement écartée.

⚠️ Note en passant : `DisableRealtimeMonitoring` est repassé à `False`
(protection temps réel Defender **réactivée**) — normal si vous l'aviez
désactivée uniquement pour un test ponctuel, mais à savoir si vous comptiez
la laisser désactivée.

### 4. Installations concurrentes de Node/prime-agent → écarté

```
where.exe node          → C:\Program Files\nodejs\node.exe (unique)
where.exe prime-agent   → C:\Users\cbrun\AppData\Roaming\npm\prime-agent{,.cmd,.ps1} (unique install)
node -p process.arch    → x64 (cohérent avec l'OS)
PATH (node|npm)         → seulement les deux entrées attendues, pas de doublon
Recherche node.exe sous Program Files / Program Files (x86) / AppData → un seul résultat
```
Aucun conflit de version ou d'architecture. Cette piste est écartée.

## Contournement à tester en priorité

Le flag `-p` / `--print` force le mode `"print"` **indépendamment de l'état
du TTY** (`if (parsed.print || !stdinIsTTY) return "print"`). Comme le mode
`print`/headless est le seul mode confirmé fonctionnel jusqu'ici, il vaut la
peine de tester, dans une vraie fenêtre PowerShell (pas via un outil
d'automatisation) :

```powershell
prime-agent --print "dis bonjour"
```

Si ça fonctionne sans timeout `worker_auth`, c'est la confirmation que le
bug est bien localisé dans le chemin de code du mode interactif (TUI plein
écran), et ça donne un contournement utilisable en attendant un correctif
upstream — au prix de perdre la session interactive continue (chaque appel
`-p` est one-shot).

## Prochaines pistes si `--print` échoue aussi

- **Tester en administrateur** — un named pipe créé sous un niveau
  d'intégrité différent peut être injoignable sans erreur explicite.
- **Chercher les issues GitHub de Prime Agent** pour `worker_auth`,
  `isTTY`, `resolveAppMode`, `fullscreen`, `Windows` (outil encore en
  v0.8.x, bug connu probable plutôt que problème de config local — le fait
  que le mode headless fonctionne à 100% pointe vers un bug interne au
  chemin TUI, pas vers l'environnement Windows en général).
- **Réinstallation propre en dernier recours** :
  ```powershell
  npm uninstall -g prime-agent
  Remove-Item -Recurse -Force $env:USERPROFILE\.prime
  npm install -g prime-agent
  ```

## Objectif

Identifier la cause racine du timeout `worker_auth` en mode interactif et
faire fonctionner `prime-agent` de façon stable dans ce dossier, avant de
connecter le provider (Claude Pro ou Codex) via `/login`.
