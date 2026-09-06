---
id: guide-utilisation
slug: /guide-utilisation
title: Guide d'utilisation
sidebar_label: Guide d'utilisation
sidebar_position: 2
description: Comment travailler concrètement avec ce dépôt — cloner, installer, lancer les tests, valider un exercice.
---

# Guide d'utilisation

Ce guide répond à une seule question : **qu'est-ce que je tape dans mon terminal ?**

---

## 1. Ce dont vous avez besoin

| Outil              | Version minimale        | Vérifier avec      | Indispensable ?       |
| ------------------ | ----------------------- | ------------------ | --------------------- |
| **Node.js**        | 22.12 (24.x recommandé) | `node -v`          | ✅ Oui                |
| **pnpm**           | 10.0                    | `pnpm -v`          | ✅ Oui                |
| **Git**            | 2.40                    | `git --version`    | ✅ Oui                |
| **VS Code**        | à jour                  | —                  | Fortement conseillé   |
| **Docker Desktop** | 24+                     | `docker --version` | À partir du module 14 |

:::tip Pourquoi pnpm et pas npm ?
Ce n'est pas une préférence esthétique. pnpm n'aplatit pas `node_modules` : un
paquet que vous n'avez pas déclaré est **introuvable**. Cela élimine les
« dépendances fantômes », qui fonctionnent sur votre machine et cassent en
production. Vous rencontrerez cette différence pour de vrai au module 08.
:::

Pas encore installé ? → [Installation détaillée](./06-installation.md)

---

## 2. Démarrage en trois commandes

```bash
git clone https://github.com/<votre-compte>/typescript-atlas.git
cd typescript-atlas
pnpm install
```

Puis vérifiez que tout est sain :

```bash
pnpm doctor
```

Cette commande contrôle vos versions d'outils et vous dit précisément quoi
corriger. **Ne passez pas à la suite tant qu'elle n'est pas verte.**

---

## 3. Lire les cours

Deux façons, au choix — le contenu est identique.

**En ligne / en local dans le navigateur** (recommandé : recherche, navigation, bilingue)

```bash
pnpm site:dev
# → http://localhost:3000
```

**Directement dans l'éditeur**, en Markdown :

```text
apps/site/docs/**        Contenu français (source)
apps/site/i18n/en/**     Contenu anglais
```

---

## 4. Faire les exercices

Le texte des ateliers est sur le site. **Le code, lui, se trouve dans `courses/`.**

```text
courses/02-systeme-de-types/
├── exercises/          ← 👈 VOUS ÉCRIVEZ ICI
│   ├── 01-inference.ts
│   └── 02-narrowing.ts
├── solutions/          ← Le corrigé (n'ouvrez qu'après avoir essayé)
│   ├── 01-inference.ts
│   └── 02-narrowing.ts
└── tests/              ← Les tests. NE LES MODIFIEZ PAS.
    ├── 01-inference.test.ts
    └── 02-narrowing.test.ts
```

### Le cycle de travail

```bash
# 1. Lancer les tests du module EN MODE SURVEILLANCE
pnpm --filter @atlas/course-02 test:watch
```

À ce stade, **tout est rouge. C'est normal et c'est voulu.** Un test rouge est
une question posée par la machine. Votre travail consiste à y répondre.

```bash
# 2. Ouvrir exercises/01-inference.ts, remplacer les TODO, sauvegarder.
#    Les tests se relancent seuls. Vous voyez immédiatement le résultat.

# 3. Quand tout est vert, vérifier aussi les types et le style :
pnpm --filter @atlas/course-02 typecheck
pnpm --filter @atlas/course-02 lint
```

:::danger Un test vert ne suffit pas
Un exercice n'est réussi que si **les trois** commandes passent :
`test`, `typecheck` et `lint`. On peut faire passer un test avec des `any`
partout — ce n'est pas de la réussite, c'est du contournement.
:::

### Comparer avec le corrigé

```bash
pnpm compare 02 01
```

Affiche votre solution et le corrigé côte à côte. Utile **après** votre
tentative — pas avant.

---

## 5. Le raccourci : `pnpm verify`

Une seule commande reproduit exactement ce que fait l'intégration continue :

```bash
pnpm verify
# = format:check → lint → typecheck → test
```

Si `pnpm verify` passe chez vous, il passera en CI. C'est le contrat.

---

## 6. Les commandes utiles

| Commande                                    | Ce qu'elle fait                            |
| ------------------------------------------- | ------------------------------------------ |
| `pnpm doctor`                               | Diagnostique votre environnement           |
| `pnpm site:dev`                             | Lance le site de formation en local        |
| `pnpm verify`                               | Toute la chaîne qualité                    |
| `pnpm test`                                 | Tous les tests du dépôt                    |
| `pnpm lint:fix`                             | Corrige automatiquement ce qui peut l'être |
| `pnpm format`                               | Reformate tout le code                     |
| `pnpm --filter @atlas/course-07 test:watch` | Tests d'un module en continu               |
| `pnpm audit:deps`                           | Vulnérabilités connues des dépendances     |
| `pnpm clean`                                | Supprime tous les artefacts de build       |

:::info Le filtre `--filter`
`pnpm --filter <paquet> <commande>` exécute une commande dans **un seul**
paquet du monorepo. Les noms suivent la convention `@atlas/course-NN`.
Pour lister tous les paquets : `pnpm ls -r --depth -1`.
:::

---

## 7. Travailler avec Docker

À partir du module 14, les services (PostgreSQL, Redis) tournent en conteneur.

```bash
# Démarrer l'infrastructure de développement
docker compose -f infra/docker/compose.dev.yaml up -d

# Vérifier que tout est en bonne santé
docker compose -f infra/docker/compose.dev.yaml ps

# Consulter les journaux
docker compose -f infra/docker/compose.dev.yaml logs -f api

# Tout arrêter (les données sont conservées)
docker compose -f infra/docker/compose.dev.yaml down

# Tout arrêter ET effacer les données
docker compose -f infra/docker/compose.dev.yaml down -v
```

---

## 8. Quand vous êtes bloqué

Dans cet ordre, sans sauter d'étape :

1. **Relisez le message d'erreur en entier.** TypeScript est verbeux mais
   presque toujours exact. Le module 01 enseigne une méthode de lecture en
   4 étapes — elle fonctionne.
2. **Regardez le test qui échoue.** Il décrit précisément le comportement attendu.
3. **Consultez l'encadré « Erreurs classiques »** en bas de chaque corrigé :
   votre problème y figure probablement.
4. **Réduisez le problème.** Recopiez le minimum de code qui reproduit l'erreur
   dans un fichier neuf. La moitié du temps, la réponse apparaît toute seule.
5. **Ouvrez le corrigé** — mais lisez-le, comprenez-le, puis **refermez-le et
   réécrivez sans regarder**. Copier-coller un corrigé n'apprend rien.

---

## Étape suivante

👉 [Méthode d'apprentissage](./03-methode-apprentissage.md) — comment apprendre pour retenir.
