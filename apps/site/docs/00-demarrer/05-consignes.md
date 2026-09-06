---
id: consignes
slug: /consignes
title: Consignes de travail
sidebar_label: Consignes
sidebar_position: 5
description: Les règles du jeu — ce qui est autorisé, ce qui est interdit, et les critères de validation d'un exercice.
---

# Consignes de travail

Ces règles ne sont pas de la bureaucratie. Chacune correspond à une habitude
professionnelle que ce parcours cherche à installer chez vous.

---

## 1. Les cinq règles d'or

### Règle 1 — `any` est interdit

`any` désactive le vérificateur de types. Ce n'est pas « un type souple » :
c'est **l'absence de type**, et sa contamination se propage silencieusement à
tout le code qui le touche.

```ts
// ❌ INTERDIT
const data: any = await response.json();
console.log(data.user.name.toUpperCase()); // compile — et casse en production

// ✅ ATTENDU
const data: unknown = await response.json();
const parsed = UserSchema.parse(data); // on VÉRIFIE avant d'utiliser
console.log(parsed.user.name.toUpperCase()); // typé, et vrai
```

**La seule exception tolérée** : une déclaration de types tierce que vous ne
contrôlez pas. Elle doit alors porter un commentaire justificatif :

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Justification : la définition amont de <paquet> expose `any` ; on l'isole
// ici, dans ce seul fichier d'adaptation, et on revalide juste en dessous.
```

### Règle 2 — On ne modifie jamais les tests

Les fichiers de `tests/` sont l'énoncé. Les modifier revient à changer la
question pour que votre réponse devienne juste.

Vous pensez qu'un test est faux ? C'est possible — [ouvrez un ticket](#7-signaler-un-problème).
Mais dans 95 % des cas, le test a raison et il vous apprend quelque chose.

### Règle 3 — Trois feux verts, pas un

Un exercice est terminé quand **les trois** commandes passent :

```bash
pnpm --filter @atlas/course-NN test       # le comportement est correct
pnpm --filter @atlas/course-NN typecheck  # les types sont corrects
pnpm --filter @atlas/course-NN lint       # le code est prudent
```

Un test vert avec des `any` partout n'est pas une réussite.

### Règle 4 — Le corrigé se lit, il ne se copie pas

Voir le [protocole en 5 étapes](./03-methode-apprentissage.md#4-protocole-dutilisation-dun-corrigé).
L'étape essentielle : **fermer le corrigé et réécrire de mémoire.**

### Règle 5 — Une règle de lint ne se désactive pas par confort

`// eslint-disable` est autorisé, mais **jamais sans commentaire de justification**
sur la ligne suivante. Si vous ne savez pas expliquer pourquoi la règle ne
s'applique pas à votre cas, c'est qu'elle s'applique.

---

## 2. Conventions de code

Elles sont **appliquées automatiquement** — vous n'avez rien à mémoriser,
mais il faut savoir qu'elles existent.

| Élément                    | Convention             | Exemple                   |
| -------------------------- | ---------------------- | ------------------------- |
| Fichiers                   | `kebab-case.ts`        | `user-repository.ts`      |
| Types et interfaces        | `PascalCase`           | `UserProfile`             |
| Variables et fonctions     | `camelCase`            | `findUserById`            |
| Constantes globales        | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`         |
| Non-utilisation volontaire | préfixe `_`            | `(_req, res) => …`        |
| Fichiers de test           | `*.test.ts`            | `user-repository.test.ts` |

:::info Le code est en anglais, la pédagogie en français
Les identifiants, noms de fichiers et commentaires **de code** sont en anglais :
c'est la langue de travail réelle du métier, et vos futurs collègues ne seront
pas tous francophones. Les explications pédagogiques, elles, sont dans votre
langue. Cette séparation est volontaire.
:::

---

## 3. Comment lire un énoncé d'exercice

Chaque fichier d'exercice suit toujours la même structure :

```ts
/**
 * EXERCICE 03 — Unions discriminées                          🟡 Consolidation
 *
 * OBJECTIF
 *   Modéliser le résultat d'une requête réseau de sorte qu'il soit
 *   IMPOSSIBLE de lire `data` tant que le chargement n'est pas terminé.
 *
 * CONTRAINTES
 *   - Aucun `any`, aucune assertion `as`.
 *   - `data` ne doit exister que dans l'état de succès.
 *
 * CRITÈRE DE RÉUSSITE
 *   Les tests passent ET les trois lignes marquées `@ts-expect-error`
 *   dans le fichier de test provoquent bien une erreur de compilation.
 *
 * INDICE (à ne lire qu'après 15 minutes de blocage)
 *   Une propriété littérale commune à tous les membres de l'union sert
 *   de « discriminant ». `typeof` ne suffira pas ici.
 */

// TODO: écrivez votre solution ici.
export type RequestState = never; // ← remplacez `never`
```

:::tip `@ts-expect-error` dans les tests
Certains tests vérifient qu'un code **refuse de compiler**. C'est normal et
c'est puissant : on ne teste pas seulement ce que votre code fait, mais aussi
**ce qu'il empêche de faire**. Un `@ts-expect-error` qui ne produit _aucune_
erreur est lui-même une erreur — le compilateur vous le signalera.
:::

---

## 4. Barème d'auto-évaluation

Après chaque exercice, situez-vous honnêtement :

| Niveau            | Signification                                         |
| ----------------- | ----------------------------------------------------- |
| ⬜ **Non acquis** | Résolu en lisant le corrigé, sans le refaire seul     |
| 🟨 **Fragile**    | Résolu seul, mais avec beaucoup de tâtonnement        |
| 🟩 **Acquis**     | Résolu seul, sans hésitation majeure                  |
| 🟦 **Maîtrisé**   | Résolu seul **et** capable de l'expliquer à quelqu'un |

**Tout ce qui n'est pas 🟩 ou 🟦 retourne dans la file de révision à J+7.**

---

## 5. Règles spécifiques aux projets

Pour les mini-projets et les projets finaux :

- **Committez petit et souvent.** Un commit = un changement cohérent.
- **Messages de commit conventionnels** : `feat:`, `fix:`, `refactor:`,
  `test:`, `docs:`, `chore:`. Ce n'est pas cosmétique : cela permet de générer
  un journal des modifications et de repérer une régression.
- **Aucun secret dans le dépôt.** Jamais. Voir `.env.example` et le module 11.
- **`pnpm verify` doit passer avant chaque commit.** Un crochet Git le
  vérifie pour vous.
- **Le README du projet fait partie du livrable.** Un projet que personne ne
  sait lancer n'existe pas.

---

## 6. Ce qui est explicitement encouragé

Pour éviter tout malentendu, voici ce qui **n'est pas** de la triche :

- ✅ Consulter la documentation officielle TypeScript — **tout le temps**
- ✅ Utiliser l'autocomplétion et le survol de types de votre éditeur
- ✅ Utiliser le TypeScript Playground pour expérimenter
- ✅ Demander de l'aide, à un humain ou à une IA, **pour comprendre**
- ✅ Lire le code source d'une bibliothèque
- ✅ Faire autrement que le corrigé, si votre version passe les trois feux verts

Ce qui n'apprend rien, en revanche :

- ❌ Faire écrire la solution par une IA, puis passer au suivant
- ❌ Copier le corrigé sans le refermer
- ❌ Ajouter `any` ou `as` jusqu'à ce que l'erreur disparaisse

:::note Sur l'usage de l'IA
Une IA est un excellent tuteur et un très mauvais raccourci. La bonne
question est « _pourquoi_ le compilateur refuse-t-il ceci ? ». La mauvaise est
« écris-moi la solution ». La première vous rend autonome, la seconde vous rend
dépendant — et cela se voit en entretien technique.
:::

---

## 7. Signaler un problème

Énoncé ambigu, test incorrect, coquille, lien mort :

1. Vérifiez d'abord dans la [FAQ](./07-faq.md).
2. Ouvrez un ticket en précisant : **module**, **fichier**, **ce que vous
   attendiez**, **ce qui s'est passé**, et la sortie de `pnpm doctor`.

Toute correction est consignée dans le [journal d'audit](../99-coulisses/01-journal-audit.md).

---

## Étape suivante

👉 [Installation](./06-installation.md) — préparer votre machine.
