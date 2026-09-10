---
id: securite-et-fiabilite
title: 'Module 11 — Strictness, sécurité et fiabilité'
sidebar_label: 'M11 · Sécurité 🔐'
sidebar_position: 3
description: Chaque option stricte expliquée, la frontière I/O où tout devient unknown, validation runtime avec Zod, erreurs comme valeurs, immutabilité, secrets, et sécurité de la chaîne d'approvisionnement.
keywords:
  [
    typescript,
    strict,
    sécurité,
    zod,
    validation,
    secrets,
    supply chain,
    unknown,
  ]
---

# Module 11 — Strictness, sécurité et fiabilité

|               |                                                                         |
| ------------- | ----------------------------------------------------------------------- |
| **Durée**     | ≈ 10 heures                                                             |
| **Prérequis** | [Module 10 — Programmer les types](../02-programmer-les-types/index.md) |
| **Livrable**  | Ne plus jamais faire confiance à une donnée sans l'avoir vérifiée       |

:::danger Module pivot de toute la formation
Tout ce que vous avez appris jusqu'ici décrit et calcule des types — mais le
module 00 vous a prévenu dès le premier jour : **les types disparaissent à
la compilation**. Ce module répond enfin, complètement, à la question
laissée en suspens depuis le tout début : _comment se protège-t-on de ce
que le compilateur ne peut, par construction, jamais garantir ?_
:::

---

## 1. Chaque option stricte, et le bug qu'elle prévient

Vous avez déjà rencontré chacune de ces options dans le `tsconfig.base.json`
de ce dépôt (module 00, module 01). Les revoici, réunies, avec le bug
concret que chacune élimine :

| Option                       | Sans elle                                                                     | Avec elle                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `strictNullChecks`           | `null`/`undefined` assignables partout                                        | Chaque possibilité de "vide" doit être traitée explicitement |
| `noUncheckedIndexedAccess`   | `arr[i]` toujours typé `T`                                                    | `arr[i]` typé `T \| undefined` — reflète la réalité          |
| `exactOptionalPropertyTypes` | `{ a?: string }` accepte `{ a: undefined }`                                   | Distingue "absent" de "présent mais vide"                    |
| `noImplicitOverride`         | Une méthode renommée dans la classe parente casse silencieusement les enfants | `override` obligatoire, l'oubli devient une erreur           |
| `useUnknownInCatchVariables` | `catch (e)` typait `e: any`                                                   | `catch (e)` type `e: unknown` — force à vérifier avant usage |

---

## 2. `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` : le vrai niveau strict

`strict: true` seul **ne suffit pas** — il n'active ni l'une ni l'autre de
ces deux options, pourtant responsables d'une classe entière de bugs de
production.

```ts
// Sans noUncheckedIndexedAccess :
const users: User[] = [];
const first = users[0]; // typé `User` — MENSONGE, le tableau est vide
first.name; // 💥 Cannot read properties of undefined

// Avec (activé dans ce dépôt) :
const first = users[0]; // typé `User | undefined` — la vérité
if (first) {
  first.name; // ✅ narrowed
}
```

```ts title="Vérifié en construisant ce module"
interface Config {
  timeout?: number;
}

const a: Config = { timeout: undefined };
// Avec exactOptionalPropertyTypes :
// ❌ Type '{ timeout: undefined; }' is not assignable to type 'Config'
//    with 'exactOptionalPropertyTypes: true'. Consider adding
//    'undefined' to the types of the target's properties.
```

:::info Pourquoi cette distinction compte au-delà de l'esthétique
`{ a?: string }` et `{ a: string | undefined }` ont l'air identiques — ils
ne le sont pas. Le premier signifie **"cette clé peut être absente"** ; le
second signifie **"cette clé existe toujours, sa valeur peut être
`undefined`"**. La différence devient un bug réel dès que vous sérialisez :
`JSON.stringify({ a: undefined })` produit `"{}"` — la clé disparaît. Un
code qui vérifie `'a' in obj` se comporte alors différemment de ce que le
type suggérait. `exactOptionalPropertyTypes` force à choisir consciemment.
:::

---

## 3. La frontière I/O : tout ce qui entre est `unknown`

C'est la règle qui traverse tout ce parcours depuis le module 00 :

> **Tout ce qui entre dans votre programme depuis l'extérieur est `unknown`
> jusqu'à preuve du contraire.**

```text
HTTP (fetch, req.body)  ─┐
JSON.parse               ─┤
process.env               ─┼──▶  unknown  ──▶  VALIDATION  ──▶  type de confiance
Base de données            ─┤
Fichiers, WebSocket        ─┘
```

Un type TypeScript est une **promesse non vérifiée** sur ces frontières
(module 00, Décision 2). La validation à l'exécution est ce qui transforme
la promesse en fait vérifié.

---

## 4. Validation à l'exécution avec Zod 4

Vous avez déjà vu ce code — `packages/contracts/src/user.ts` de ce dépôt :

```ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof UserSchema>;
```

**Un seul schéma, deux usages** :

```ts
// 1. Un TYPE STATIQUE, pour le compilateur :
function greet(user: User) {
  console.log(user.displayName);
}

// 2. Une VALIDATION RUNTIME, pour les données réelles :
const response: unknown = await fetch('/api/user').then((r) => r.json());
const result = UserSchema.safeParse(response);

if (!result.success) {
  console.error(result.error.issues); // liste détaillée de ce qui cloche
  throw new Error('Réponse API invalide');
}

greet(result.data); // ✅ `result.data` est un VRAI `User`, prouvé, pas supposé
```

`z.infer<typeof UserSchema>` élimine le risque que le module 03 vous a
signalé pour le typage manuel : **il ne peut pas exister** de divergence
entre le type et la validation, puisque le second **génère** le premier.
C'est le motif que `taskline` a implémenté à la main (`validate.ts`) avant
que Zod ne soit introduit ici — comprendre le problème avant l'outil qui
l'automatise est ce qui rend l'outil compréhensible plutôt que magique.

---

## 5. Erreurs comme valeurs : le patron `Result`

```ts
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Vous l'avez déjà utilisé deux fois dans ce parcours (`ValidationResult` de
`taskline`, `ParseResult` de `csv-forge`) — c'est le même patron, sous un
nom générique. **Quand l'utiliser plutôt que `throw` ?**

| Situation                                                                                | Approche recommandée                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Échec **attendu**, faisant partie du flux normal (validation, parsing)                   | `Result` — l'appelant DOIT gérer le cas                       |
| Échec **exceptionnel**, qui ne devrait presque jamais arriver (bug, panne réseau totale) | `throw` — remonte jusqu'à un gestionnaire global              |
| Fonction utilitaire pure, testée isolément                                               | `Result` — pas d'effet de bord caché dans le flux de contrôle |

:::warning `throw` n'apparaît nulle part dans une signature de type

```ts
function parseAge(raw: string): number {
  const age = Number(raw);
  if (Number.isNaN(age)) throw new Error('Âge invalide');
  return age;
}
```

Rien, dans le type `(raw: string) => number`, ne signale que cette fonction
peut lever une exception. L'appelant doit **lire le code source** pour le
savoir — `Result` rend ce risque **visible dans la signature elle-même**,
donc vérifiable par le compilateur à chaque site d'appel.
:::

---

## 6. Immutabilité : `readonly` profond

```ts
interface Settings {
  readonly theme: string;
  readonly limits: { readonly max: number }; // readonly ne se propage PAS automatiquement
}

const s: Settings = { theme: 'dark', limits: { max: 10 } };
s.limits.max = 999; // ✅ compile ! `limits` est readonly, pas son CONTENU
```

`readonly` est **superficiel** par défaut — il protège une propriété, pas
ce qu'elle contient. Un utilitaire `DeepReadonly<T>` (un type mappé
récursif, module 09 + module 10) applique `readonly` à chaque niveau :

```ts
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

const deep: DeepReadonly<Settings> = { theme: 'dark', limits: { max: 10 } };
deep.limits.max = 999; // ❌ enfin refusé, à toute profondeur
```

---

## 7. Variables d'environnement : typées, jamais de secret dans le dépôt

```ts
// ❌ process.env.PORT est typé `string | undefined` — TOUJOURS, même
//    si vous "savez" qu'il est défini en production
const port = process.env.PORT; // string | undefined

// ✅ Validé une seule fois, au démarrage, avec Zod :
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.url(),
});

const env = EnvSchema.parse(process.env);
// env.PORT est un `number`, GARANTI, pour tout le reste du programme
```

:::danger Règle absolue, sans exception
**Aucun secret ne vit dans le dépôt Git** — jamais, pas même « temporairement »,
pas même dans un commit qu'on compte « nettoyer après ». Ce dépôt applique
cette règle structurellement : `.env` est ignoré par `.gitignore`, seul
`.env.example` (sans valeur réelle) est suivi. Un secret committé une seule
fois reste dans l'historique Git **pour toujours**, même après suppression
du fichier — la seule remédiation réelle est de révoquer et régénérer le
secret compromis.
:::

---

## 8. Sécurité de la chaîne d'approvisionnement

Ce dépôt applique déjà, concrètement, ce que cette section explique :

- **Lockfile committé** (`pnpm-lock.yaml`) : chaque installation, sur
  n'importe quelle machine, résout **exactement** les mêmes versions.
- **Scripts d'installation bloqués par défaut** (pnpm 10,
  `onlyBuiltDependencies` dans `pnpm-workspace.yaml`, AUD-001) : une
  dépendance ne peut pas exécuter de code arbitraire à l'installation sans
  autorisation explicite, package par package.
- **`pnpm audit`** (`pnpm audit:deps` dans ce dépôt) : détecte les
  vulnérabilités connues dans l'arbre de dépendances.
- **Versions épinglées, jamais de plage trop large** sur les dépendances
  structurantes (`typescript: "~6.0.3"`, pas `"*"` ni même `"^6.0.3"` pour
  ce paquet précis — voir AUD-002 pour le raisonnement complet).

---

## 9. Lint type-aware : ce que `tsc` seul laisse passer

Vous l'avez rencontré très concrètement dès le module 00 (AUD-004) : la
configuration ESLint de ce dépôt a été **prouvée**, pas supposée, avec une
sonde à défauts délibérés. Les règles les plus rentables :

```ts
async function saveUser(user: User): Promise<void> {
  /* … */
}

function handleClick() {
  saveUser(currentUser); // ❌ no-floating-promises : le rejet est PERDU
}
```

`tsc` **compile** ce code sans la moindre plainte — une promesse non
attendue est syntaxiquement valide. Seul le lint type-aware, qui comprend
que `saveUser` retourne une `Promise`, peut détecter que son résultat est
ignoré. C'est la démonstration la plus directe qu'un compilateur qui
vérifie les _types_ et un linter qui vérifie la _prudence_ répondent à
deux questions différentes (module 00, module 08).

---

## 10. Ce que vous devez retenir

1. **`strict: true` ne suffit pas** — `noUncheckedIndexedAccess` et
   `exactOptionalPropertyTypes` couvrent des classes de bugs distinctes,
   non incluses par défaut.
2. **Tout ce qui vient de l'extérieur est `unknown` jusqu'à validation** —
   un type sans validation est une promesse, pas une garantie.
3. **Zod produit type ET validation depuis une seule source de vérité** —
   les deux ne peuvent structurellement pas diverger.
4. **`Result` rend un échec attendu visible dans la signature** ; `throw`
   reste pour l'exceptionnel.
5. **`readonly` ne se propage pas automatiquement** — un type mappé
   récursif est nécessaire pour une immutabilité réellement profonde.
6. **Aucun secret ne vit jamais dans le dépôt**, sans exception.

---

## 11. Auto-évaluation

1. Donnez un exemple concret où `noUncheckedIndexedAccess` évite un
   `TypeError` en production, que `strict: true` seul n'aurait pas empêché.
2. Pourquoi `{ a?: string }` et `{ a: string | undefined }` ne sont-ils PAS
   équivalents dès que la sérialisation JSON entre en jeu ?
3. Réécrivez la validation manuelle de `taskline/src/validate.ts` avec Zod.
   Combien de lignes disparaissent, et pourquoi ?
4. Dans quel cas précis préférez-vous `throw` à un `Result` — et
   inversement ?
5. Pourquoi un secret committé « par erreur » puis supprimé au commit
   suivant reste-t-il compromis ?

---

## Étape suivante

👉 🛠️ **[Mini-projet 3 — `typed-router`](../04-mini-projet-typed-router/index.md)**

Un routeur qui déduit les paramètres nommés d'une route depuis sa chaîne
d'URL — l'application directe des littéraux de gabarit et de `infer` du
module 09.

Ce mini-projet clôt la Partie III — et avec elle, la moitié « langage » de
ce parcours. La Partie IV _(en cours de rédaction)_ passe du langage à
l'industrialisation : tests, Docker, intégration continue.
