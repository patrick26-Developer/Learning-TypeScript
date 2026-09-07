---
id: modules-et-declarations
title: 'Module 08 — Modules, déclarations, @types, augmentation'
sidebar_label: 'M08 · Modules & déclarations'
sidebar_position: 4
description: Résolution de modules (node16/nodenext contre bundler), fichiers .d.ts, DefinitelyTyped, augmentation de modules globaux, et les dépendances fantômes.
keywords:
  [
    typescript,
    modules,
    declaration files,
    d.ts,
    DefinitelyTyped,
    module augmentation,
    dépendances fantômes,
  ]
---

# Module 08 — Modules, déclarations, `@types`, augmentation

|               |                                                                 |
| ------------- | --------------------------------------------------------------- |
| **Durée**     | ≈ 6 heures                                                      |
| **Prérequis** | [Module 07 — Narrowing avancé](../03-narrowing-avance/index.md) |
| **Livrable**  | Publier et consommer des types partagés entre plusieurs paquets |

---

## 1. Résolution de modules : `nodenext` contre `bundler`

TypeScript doit savoir **comment** un `import './x'` doit être résolu en
fichier réel — et cette résolution diffère selon l'environnement cible.

| `moduleResolution` |     Extension obligatoire     | Respecte `package.json#exports` | Utilisé pour                                                      |
| ------------------ | :---------------------------: | :-----------------------------: | ----------------------------------------------------------------- |
| `nodenext`         | ✅ (`.js` même pour du `.ts`) |               ✅                | Node.js en production — **ce dépôt**                              |
| `bundler`          |        ❌ optionnelle         |               ✅                | Code destiné à Vite/Webpack (jamais exécuté par Node directement) |

C'est pourquoi `apps/site/tsconfig.json` (Docusaurus, empaqueté par
webpack) utilise `bundler`, tandis que `tsconfig.base.json` (tout le reste,
exécuté par Node) utilise `nodenext` — vous l'avez rencontré concrètement
au module 01, avec l'obligation d'écrire `.js` dans les imports relatifs.

---

## 2. `import type` et l'effacement des imports

```ts
import type { User } from './user.js'; // uniquement un TYPE
import { UserSchema, type User } from './user.js'; // les deux, combinés
```

Avec `verbatimModuleSyntax` (actif dans ce dépôt, module 00) : tout import
qui ne sert **qu'à des types** doit être marqué `type`. Cela garantit qu'à
l'exécution, cet import **disparaît totalement** — aucun module chargé
inutilement, aucun risque de dépendance circulaire causée par un import qui
n'existait que pour un type.

```ts
// ❌ Sans `type`, si User est utilisé UNIQUEMENT comme type :
import { User } from './user.js';
// Le linter (consistent-type-imports, module 00 §4) le signale.
```

---

## 3. Fichiers `.d.ts` : lire, écrire, publier des types

Un fichier `.d.ts` ne contient **que des déclarations**, jamais
d'implémentation :

```ts title="math.d.ts"
export declare function add(a: number, b: number): number;
export declare const PI: number;
```

```ts title="math.js"
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;
```

Ce sont **deux fichiers séparés**, livrés ensemble : le `.js` pour
l'exécution, le `.d.ts` pour la vérification de types côté consommateur.
C'est exactement ce que produit `tsc` avec `"declaration": true` (activé
dans les bibliothèques de ce dépôt, comme `@atlas/contracts`).

---

## 4. `DefinitelyTyped` : évaluer la qualité d'un paquet de types

Une bibliothèque JavaScript sans types propres reçoit souvent ses types
d'un paquet séparé, communautaire :

```bash
npm install express
npm install --save-dev @types/express
```

:::info Comment juger la fiabilité d'un `@types/*`

- **Le nombre de téléchargements hebdomadaires** — un signal de maintenance active.
- **La date de dernière publication** — des types périmés mentent activement.
- **La correspondance de version** — `@types/express@5` pour `express@5`, jamais
  un décalage majeur.
- **La présence de types natifs** — de plus en plus de paquets (Zod, ce
  dépôt) publient directement leurs propres `.d.ts` : dans ce cas, AUCUN
  `@types/*` séparé n'existe ni n'est nécessaire — vérifiez le champ
  `"types"` du `package.json` du paquet avant de chercher un `@types/*`.
  :::

---

## 5. Augmentation de modules et d'interfaces globales

Un besoin fréquent : ajouter un champ à un type que vous **ne possédez
pas** — typiquement, attacher des données à l'objet `Request` d'Express
(module 15 l'utilisera réellement) :

```ts title="src/types/express.d.ts"
import 'express'; // rend ce fichier un MODULE, condition pour augmenter

declare module 'express' {
  interface Request {
    userId?: string;
  }
}
```

Ceci s'appuie directement sur la **fusion de déclarations** du module 05 :
`interface Request` ici **fusionne** avec l'`interface Request` déclarée à
l'intérieur du paquet `express`, sans jamais modifier son code source.

---

## 6. Chemins d'import (`paths`) et frontières architecturales

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

:::warning Un piège vécu dans la construction de ce dépôt
`paths` ne fonctionne **qu'au niveau de la vérification de types** — un
bundler ou Node à l'exécution doit recevoir sa **propre** configuration
équivalente (alias Vite, `imports` du `package.json`…), sinon `tsc` accepte
l'import mais l'exécution échoue avec `Cannot find module '@app/x'`. C'est
exactement pourquoi `apps/site/tsconfig.json` déclare `@site/*` : Docusaurus
fournit lui-même l'équivalent webpack de cet alias — les deux
configurations doivent rester synchronisées.
:::

### Les dépendances fantômes, concrètement

```ts
// Dans un paquet qui N'A PAS déclaré `lodash` dans son package.json,
// mais où `lodash` se trouve être installé par un AUTRE paquet du monorepo :
import { debounce } from 'lodash'; // fonctionnerait avec npm/yarn (hoisting)
```

Avec `hoist=false` (ce dépôt, AUD-001), cet import **échoue** :
`Cannot find module 'lodash'`. C'est la démonstration directe, pas
seulement l'affirmation, de ce qu'un import non déclaré dans son propre
`package.json` **ne devrait jamais fonctionner**, même s'il fonctionnait
« par accident » ailleurs.

---

## 7. Ce que vous devez retenir

1. **`nodenext` exige l'extension `.js` dans les imports relatifs, `bundler`
   ne l'exige pas** — le choix dépend de qui exécute le code au final.
2. **`import type` garantit qu'un import disparaît à l'exécution.**
3. **Un `.d.ts` et son `.js` sont deux fichiers séparés**, livrés ensemble.
4. **`paths` ne vaut que pour `tsc`** — l'exécution réelle a besoin de sa
   propre configuration équivalente.
5. **pnpm rend les dépendances fantômes visibles**, là où npm/yarn les
   laissent fonctionner par accident jusqu'à ce qu'elles cassent ailleurs.

---

## 8. Auto-évaluation

1. Pourquoi `apps/site` de ce dépôt utilise-t-il `bundler` alors que le
   reste du monorepo utilise `nodenext` ?
2. Que se passe-t-il à l'exécution si vous oubliez `type` sur un import qui
   ne sert qu'à un type, avec `verbatimModuleSyntax` désactivé ? Et activé ?
3. Un paquet npm ne fournit aucun `.d.ts` et n'a pas de `@types/*`
   disponible. Citez deux options pour l'utiliser malgré tout en TypeScript.
4. Pourquoi l'augmentation d'`interface Request` d'Express ne modifie-t-elle
   jamais le code source d'Express lui-même ?
5. Pourquoi une dépendance fantôme peut-elle fonctionner sur la machine
   d'une personne et échouer sur celle d'une autre ?

---

## Étape suivante

👉 🛠️ **Mini-projet 2 — `csv-forge`**

Un parseur CSV typé par son schéma : vous déclarez les colonnes, la
bibliothèque en déduit le type des lignes. Le code se trouve dans
`projects/mini/csv-forge/` — voir son
[README](https://github.com/patrick26-Developer/Learning-TypeScript/tree/main/projects/mini/csv-forge)
pour démarrer.
