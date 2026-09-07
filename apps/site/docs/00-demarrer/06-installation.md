---
id: installation
slug: /installation
title: Installation
sidebar_label: Installation
sidebar_position: 6
description: Préparer votre machine — Node.js, pnpm, Git, VS Code et Docker, sur Windows, macOS et Linux.
---

# Installation

Objectif de cette page : que `pnpm doctor` affiche **tout en vert**.
Comptez 20 à 30 minutes la première fois.

---

## 1. Node.js

TypeScript s'exécute sur Node.js. Il vous faut la version **22.12 ou plus**
(la 24.x est recommandée).

:::warning N'installez pas Node depuis le gestionnaire de paquets système
`apt install nodejs`, Homebrew ou l'installateur `.msi` figent une version que
vous ne pourrez plus changer facilement. Or un développeur professionnel jongle
entre plusieurs versions de Node selon les projets.
**Utilisez un gestionnaire de versions.** C'est cinq minutes de plus aujourd'hui
et des heures économisées plus tard.
:::

### Windows — `fnm`

```powershell
# Installation du gestionnaire de versions
winget install Schniz.fnm

# Fermez et rouvrez PowerShell, puis :
fnm install 24
fnm use 24
fnm default 24
```

Pour que `fnm` s'active automatiquement à chaque ouverture de terminal,
ajoutez ceci à votre profil PowerShell (`notepad $PROFILE`) :

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

### macOS / Linux — `fnm`

```bash
curl -fsSL https://fnm.vercel.app/install | bash
# Rouvrez le terminal, puis :
fnm install 24
fnm default 24
```

### Vérification

```bash
node -v    # doit afficher v24.x.x (ou au minimum v22.12.x)
```

:::tip Le fichier `.nvmrc`
Ce dépôt contient un fichier `.nvmrc` indiquant la version exacte utilisée.
Dans le dossier du projet, `fnm use` bascule automatiquement dessus.
:::

---

## 2. pnpm

```bash
# Corepack est fourni avec Node : il installe le bon gestionnaire de paquets
# à la version exacte demandée par le projet.
corepack enable
corepack prepare pnpm@10.11.0 --activate
```

Si `corepack` n'est pas disponible :

```bash
npm install -g pnpm@10
```

### Vérification

```bash
pnpm -v    # doit afficher 10.x.x
```

---

## 3. Git

| Système       | Commande                                         |
| ------------- | ------------------------------------------------ |
| Windows       | `winget install Git.Git`                         |
| macOS         | `brew install git` (ou `xcode-select --install`) |
| Debian/Ubuntu | `sudo apt install git`                           |

Configuration minimale, à faire une seule fois :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "vous@exemple.com"

# Windows uniquement : évite que Git réécrive les fins de ligne et pollue
# tous vos diffs. Le dépôt impose déjà LF via .editorconfig et .gitattributes.
git config --global core.autocrlf input
```

---

## 4. VS Code

Téléchargement : [code.visualstudio.com](https://code.visualstudio.com/)

À l'ouverture du dossier du projet, VS Code vous proposera les extensions
recommandées (elles sont déclarées dans `.vscode/extensions.json`).
**Acceptez.** Les principales :

| Extension                    | Rôle                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| **ESLint**                   | Souligne les erreurs de prudence directement dans l'éditeur    |
| **Prettier**                 | Formate à la sauvegarde                                        |
| **Error Lens**               | Affiche l'erreur en bout de ligne — gain de temps considérable |
| **Pretty TypeScript Errors** | Rend lisibles les erreurs de types complexes                   |
| **Vitest**                   | Lance les tests depuis l'éditeur                               |

:::danger Réglage critique : utiliser le TypeScript du projet
VS Code embarque sa propre version de TypeScript, généralement différente de
celle du projet. Vous verriez alors des erreurs qui n'existent pas — ou pire,
vous n'en verriez pas qui existent.

**Correctif :** ouvrez un fichier `.ts`, faites `Ctrl+Shift+P` →
`TypeScript: Select TypeScript Version` → **Use Workspace Version**.

Le fichier `.vscode/settings.json` du dépôt le configure déjà pour vous, mais
vérifiez : c'est la source n° 1 de confusion chez les débutants.
:::

---

## 5. Docker _(à partir du module 14)_

Vous pouvez commencer la formation sans. Installez-le avant le module 14.

| Système | Solution                                                                                     |
| ------- | -------------------------------------------------------------------------------------------- |
| Windows | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (activer le backend WSL 2) |
| macOS   | Docker Desktop, ou [OrbStack](https://orbstack.dev/) (plus léger et plus rapide)             |
| Linux   | Docker Engine + le plugin `docker compose`                                                   |

### Vérification

```bash
docker --version
docker compose version
docker run --rm hello-world
```

---

## 6. Récupérer le projet

```bash
git clone https://github.com/patrick26-Developer/Learning-TypeScript.git
cd Learning-TypeScript
pnpm install
```

La première installation télécharge un volume important de dépendances
(comptez 2 à 5 minutes). Les suivantes seront quasi instantanées : pnpm
mutualise les paquets dans un magasin global.

---

## 7. Contrôle final

```bash
pnpm doctor
```

Sortie attendue :

```text
TypeScript Atlas — diagnostic de l'environnement

  ✅  Node.js            v24.7.0     (requis : >=22.12.0)
  ✅  pnpm               10.11.0     (requis : >=10.0.0)
  ✅  Git                2.49.0      (requis : >=2.40.0)
  ✅  Dépendances        installées
  ⚠️   Docker             absent      (requis à partir du module 14)

  Environnement prêt. Bon travail !
```

Puis lancez le site en local :

```bash
pnpm site:dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous y êtes.

---

## 8. Problèmes fréquents

<details>
<summary><strong>« pnpm : commande introuvable » après <code>corepack enable</code></strong></summary>

Corepack crée un raccourci dans le dossier des exécutables de Node. Fermez et
rouvrez complètement votre terminal. Sous Windows, un redémarrage de session
est parfois nécessaire pour que la variable `PATH` soit rechargée.

</details>

<details>
<summary><strong>« Unsupported engine » à l'installation</strong></summary>

Votre version de Node est trop ancienne. Le dépôt active `engine-strict` :
il refuse volontairement de s'installer sur une version non supportée, plutôt
que de vous laisser rencontrer une erreur incompréhensible plus tard.

```bash
fnm use 24
node -v
pnpm install
```

</details>

<details>
<summary><strong>VS Code souligne des erreurs qui n'existent pas en ligne de commande</strong></summary>

C'est le problème de version de TypeScript décrit au § 4. Basculez sur
« Use Workspace Version », puis `Ctrl+Shift+P` → `TypeScript: Restart TS Server`.

</details>

<details>
<summary><strong>Erreurs de fins de ligne (CRLF/LF) sous Windows</strong></summary>

```bash
git config --global core.autocrlf input
git rm --cached -r .
git reset --hard
```

</details>

<details>
<summary><strong>ESLint est très lent</strong></summary>

C'est attendu : ce dépôt utilise le lint **type-aware**, qui charge le
vérificateur de types complet. La première exécution peut prendre 1 à 3 minutes,
les suivantes sont mises en cache. C'est le prix d'un lint qui détecte de vrais
bugs plutôt que des questions de mise en forme.

Pour ne linter qu'un seul module :

```bash
pnpm --filter @atlas/course-07 lint
```

</details>

---

## Étape suivante

👉 [FAQ](./07-faq.md) — les questions que tout le monde se pose.
👉 [Orientation](./04-orientation-parcours.md) — choisir votre point d'entrée.
