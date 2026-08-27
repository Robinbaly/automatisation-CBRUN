# Prime Agent bloque au démarrage sur Windows (MSI)

Statut : **non résolu** — en cours d'investigation.
Ouvert le : 27/08/2026.

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

## Diagnostic — pistes à suivre, par ordre de priorité

1. **Tester hors Git Bash.** Git Bash tourne dans MinTTY, qui n'est pas une
   vraie console Win32 (pty émulé au-dessus de pipes). C'est une source
   connue de bugs pour les outils Node qui font du multi-process avec des
   named pipes / handles hérités. Relancer `prime-agent` dans PowerShell ou
   cmd.exe (Windows Terminal) plutôt que Git Bash.
2. **Vérifier un EDR/AV tiers ou une GPO d'entreprise** au-delà de Defender :
   ```powershell
   Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct | Select displayName, productState
   Get-Service | Where-Object {$_.DisplayName -match "Sophos|CrowdStrike|Cortex|SentinelOne|Bitdefender|Norton|Trellix|Carbon Black"}
   Get-Service -Name intunemanagementextension -ErrorAction SilentlyContinue
   ```
3. **Sonder le pipe directement** pendant que le worker tourne et attend
   (avant le timeout) :
   ```powershell
   Test-Path \\.\pipe\prime-agent-daemon
   [System.IO.Directory]::GetFiles("\\.\pipe\")
   ```
   Si `prime-agent-daemon` n'apparaît pas alors que le worker dit l'écouter,
   c'est un bug de nommage côté outil (nom de pipe calculé différemment par
   le worker et par le superviseur, ex. dérivé du cwd ou d'un PID).
4. **Chercher des installations concurrentes de Node/prime-agent** :
   ```powershell
   where node
   where prime-agent
   node -p "process.arch"
   ```
5. **Tester en administrateur** — un named pipe créé sous un niveau
   d'intégrité différent peut être injoignable sans erreur explicite.
6. **Chercher les issues GitHub de Prime Agent** pour `worker_auth`, `named
   pipe`, `ENOENT pipe`, `Windows` (outil encore en v0.8.x, bug connu
   probable plutôt que problème de config local).
7. **Réinstallation propre en dernier recours** :
   ```powershell
   npm uninstall -g prime-agent
   Remove-Item -Recurse -Force $env:USERPROFILE\.prime
   npm install -g prime-agent
   ```

## Objectif

Identifier la cause racine du timeout `worker_auth` et faire fonctionner
`prime-agent` de façon stable dans ce dossier, avant de connecter le
provider (Claude Pro ou Codex) via `/login`.
