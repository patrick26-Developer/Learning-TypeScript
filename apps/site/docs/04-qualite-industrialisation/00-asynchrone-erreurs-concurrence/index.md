---
id: asynchrone-erreurs-concurrence
title: 'Module 12 — Asynchrone typé, erreurs, concurrence, annulation'
sidebar_label: 'M12 · Asynchrone'
sidebar_position: 1
description: Le piège de Promise<Promise<T>>, les promesses flottantes, Promise.all/allSettled/race/any typés, unknown dans catch, AbortController, générateurs asynchrones et concurrence contrôlée.
keywords:
  [
    typescript,
    asynchrone,
    promise,
    async,
    await,
    abortcontroller,
    concurrence,
    générateurs,
  ]
---

# Module 12 — Asynchrone typé, erreurs, concurrence, annulation

|               |                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Durée**     | ≈ 8 heures                                                                                    |
| **Prérequis** | [Module 11 — Sécurité et fiabilité](../../03-typage-expert/03-securite-et-fiabilite/index.md) |
| **Livrable**  | Écrire du code asynchrone dont le compilateur peut réellement garantir la forme               |

:::tip Ce que ce module change
Jusqu'ici, vous avez typé des **valeurs**. L'asynchrone typé des
**événements dans le temps** : une valeur qui n'existe pas encore, une
opération qui peut être annulée en cours de route, plusieurs tâches qui
s'exécutent en parallèle sans jamais dépasser une limite donnée. Le
compilateur y est étonnamment bon — à condition de connaître exactement où
ses garanties s'arrêtent.
:::

---

## 1. Le piège de `Promise<Promise<T>>` — vérifié en direct

Une promesse **ne peut structurellement pas** en contenir une autre : la
spécification Promises/A+ **aplatit automatiquement** toute promesse
résolue avec une autre promesse (ou plus généralement un _thenable_) —
récursivement, autant de niveaux que nécessaire.

```ts
async function inner(): Promise<number> {
  return 42;
}

async function outer(): Promise<number> {
  return inner(); // retourne une Promise<number>, jamais number directement
}

const value = await outer();
console.log(typeof value, value); // "number 42" — jamais une Promise imbriquée
```

Rien de surprenant jusque-là. Voici en revanche ce qui **devrait** vous
surprendre :

:::info Vérifié pendant la rédaction de ce module

```ts
// TypeScript accepte CETTE annotation sans une seule erreur,
// même en `--strict` :
async function doublyAnnotated(): Promise<Promise<number>> {
  return 42;
}
```

`tsc --noEmit --strict` ne signale **aucune erreur** sur ce code. Le type
`Promise<Promise<number>>` est parfaitement exprimable — et pourtant,
**aucune valeur ne peut jamais l'habiter réellement** : au runtime, la
promesse s'aplatit toujours, quoi que vous fassiez.

```ts
const nested: Promise<number> = new Promise((resolve) => {
  resolve(Promise.resolve(42) as unknown as number); // contournement du typage, volontaire
});
nested.then((v) => console.log(typeof v, v));
// → "number 42" — même en résolvant explicitement AVEC une promesse imbriquée
```

:::

:::danger La leçon
Si vous voyez un jour un type `Promise<Promise<T>>` dans votre code — dans
une signature écrite à la main, ou pire, déduite par le compilateur depuis
un générique mal contraint — **c'est toujours un signe d'erreur de
typage**, jamais une situation réelle possible. La correction est presque
toujours d'ajouter un `await` qui manque, ou de retirer un niveau
d'enveloppement `Promise<...>` superflu dans une signature.
:::

---

## 2. Les promesses flottantes — la première cause de bugs silencieux

Une promesse dont on ignore le résultat continue de s'exécuter, mais **plus
personne n'observe** ni sa réussite, ni son échec.

```ts
function saveUser(user: User): Promise<void> {
  return db.users.insert(user);
}

// ❌ La fonction s'exécute, mais son échec disparaît dans le vide.
// Si insert() rejette, RIEN ne le signale : pas de log, pas de crash,
// pas de retry. L'utilisateur croit que la sauvegarde a réussi.
function handler(req: Request, res: Response) {
  saveUser(req.body);
  res.status(201).send();
}
```

Ce dépôt bloque cette classe de bugs dès l'écriture, via la règle
[`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises/)
(voir `packages/eslint-config/base.mjs`, module 01) — vous l'avez déjà
rencontrée dans la sonde de validation du lint (journal d'audit, AUD-004).

```ts
// ✅ Trois façons correctes de traiter une promesse, du plus explicite
// au plus concis :

// 1. `await`, dans une fonction async — la plus lisible.
async function handler(req: Request, res: Response) {
  await saveUser(req.body);
  res.status(201).send();
}

// 2. `.catch()` explicite, quand on ne peut pas attendre (ex. un effet
//    de bord "fire and forget" volontaire, comme un log d'analytics).
saveUser(req.body).catch((error: unknown) => {
  logger.error('Échec de sauvegarde utilisateur', { error });
});

// 3. `void`, uniquement quand l'échec est SANS CONSÉQUENCE et déjà
//    géré à l'intérieur de la fonction elle-même — jamais un raccourci
//    pour "je n'ai pas envie de gérer l'erreur".
void saveUser(req.body);
```

---

## 3. `Promise.all`, `allSettled`, `race`, `any` — typés correctement

Les quatre combinateurs répondent à des questions différentes, et leurs
types le reflètent exactement.

| Combinateur          | Répond à                          | Si UNE promesse échoue                                  |
| -------------------- | --------------------------------- | ------------------------------------------------------- |
| `Promise.all`        | Toutes ont-elles réussi ?         | Rejette immédiatement, les autres résultats sont perdus |
| `Promise.allSettled` | Que s'est-il passé pour chacune ? | Ne rejette jamais — chaque résultat est rapporté        |
| `Promise.race`       | Laquelle finit en premier ?       | Rejette dès la première à se régler, succès ou échec    |
| `Promise.any`        | Laquelle **réussit** en premier ? | Rejette seulement si **toutes** échouent                |

### `allSettled` : narrowing vérifié sur le discriminant `status`

```ts
const results = await Promise.allSettled([fetchUser(1), fetchUser(2)]);

for (const r of results) {
  if (r.status === 'fulfilled') {
    console.log(r.value); // ✅ typé User — le narrowing fonctionne
  } else {
    console.log(r.reason); // ✅ typé unknown — jamais any
  }
}
```

:::info Vérifié pendant la rédaction de ce module
`r.status === 'fulfilled'` narrow bien `r` vers
`{ status: 'fulfilled'; value: T }`, exactement comme une union discriminée
écrite à la main (module 07) — TypeScript traite
`PromiseSettledResult<T>` comme l'union qu'elle est réellement.
:::

### `any` : l'échec total est un vrai `AggregateError`

```ts
try {
  const first = await Promise.any([fetchFromCacheA(), fetchFromCacheB()]);
  console.log(first);
} catch (error) {
  // Vérifié : si TOUTES rejettent, `error` est une instance réelle
  // d'AggregateError, avec un tableau `.errors` contenant chaque cause.
  if (error instanceof AggregateError) {
    console.log(error.errors); // Error[]
  }
}
```

---

## 4. Erreurs : `unknown` dans `catch`, erreurs personnalisées, `cause`

### `unknown`, pas `any`

Ce dépôt active `useUnknownInCatchVariables` (inclus dans `strict`, module 11) : `catch (e)` type `e` en `unknown`, jamais `any`. JavaScript autorise
de lancer **n'importe quelle valeur** (`throw "erreur"`, `throw 42`) — pas
seulement des `Error` — donc `unknown` reflète la réalité, `any` mentait.

```ts
try {
  riskyOperation();
} catch (e) {
  // ❌ e.message : erreur de compilation — e est unknown, pas Error
  if (e instanceof Error) {
    console.error(e.message); // ✅ narrowed vers Error
  } else {
    console.error('Valeur non-Error levée :', e);
  }
}
```

### Erreurs personnalisées, avec `cause`

```ts
class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: 'NOT_FOUND' | 'CONFLICT' | 'UNAVAILABLE',
    options?: ErrorOptions, // { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'RepositoryError';
  }
}

try {
  await db.users.findById(id);
} catch (cause) {
  // `cause` chaîne l'erreur d'origine SANS perdre son contexte —
  // visible dans les journaux, les débogueurs et Node ≥ 16.9.
  throw new RepositoryError(`Utilisateur ${id} introuvable`, 'NOT_FOUND', {
    cause,
  });
}
```

`RepositoryError.code` est une union littérale, pas une `string` : un
`switch (error.code)` bénéficie de l'exhaustivité par `never` (module 07).

---

## 5. `AbortController` — et sa faille de typage, vérifiée

```ts
async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error(`Délai dépassé après ${String(timeoutMs)} ms`));
  }, timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
```

:::danger Vérifié pendant la rédaction de ce module — une vraie faille
`AbortSignal.reason` est typé **`any`**, pas `unknown` :

```ts
function check(signal: AbortSignal) {
  if (signal.aborted) {
    // Compile SANS ERREUR, même en --strict — aucun narrowing exigé.
    signal.reason.toUpperCase().trim();
  }
}
```

`tsc --noEmit --strict` accepte ce code tel quel, alors que `reason` peut
être **n'importe quoi** — la valeur passée à `.abort(...)`, potentiellement
`undefined` si `.abort()` est appelé sans argument. C'est une brèche
réelle dans les définitions de types de la bibliothèque standard (module
00, §3 : le système de types n'est pas sain, et ceci en est un exemple
concret, pas théorique). **Traitez toujours `signal.reason` comme
`unknown` vous-même**, avec un `instanceof Error` ou une validation
explicite, exactement comme dans un `catch`.
:::

---

## 6. Itérateurs et générateurs asynchrones, typés

```ts
async function* paginate<T>(
  fetchPage: (cursor: string | null) => Promise<{
    items: T[];
    nextCursor: string | null;
  }>,
): AsyncGenerator<T, void, unknown> {
  let cursor: string | null = null;
  do {
    const page = await fetchPage(cursor);
    yield* page.items; // délègue chaque élément individuellement
    cursor = page.nextCursor;
  } while (cursor !== null);
}

for await (const item of paginate(fetchUsersPage)) {
  console.log(item); // typé T, jamais T | undefined
}
```

:::info Vérifié pendant la rédaction de ce module
`for await...of` infère correctement le type de chaque valeur produite
(`number`, dans un test avec un générateur `countUp`) — pas de perte de
précision, pas d'union parasite avec `undefined`.
:::

`AsyncGenerator<Yield, Return, Next>` prend trois paramètres de type :
ce qui est produit par `yield`, ce que retourne le générateur à son
épuisement, et ce que `.next(valeur)` peut lui injecter — rarement utilisé
en pratique, mais bon à savoir lire dans les définitions de types.

---

## 7. Concurrence contrôlée : limitation, file d'attente, repli exponentiel

Lancer 500 requêtes HTTP en parallèle avec `Promise.all` **sature** le
serveur distant, ou déclenche sa limitation de débit. Le patron correct
limite le nombre de tâches **simultanées**, sans bloquer les suivantes.

```ts
/**
 * Exécute `tasks` avec au plus `limit` exécutions simultanées.
 * Le type de retour préserve l'ordre ET le type de chaque tâche.
 */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await task(items[current]!);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}
```

### Réessai avec repli exponentiel

```ts
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: { maxAttempts: number; baseDelayMs: number },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.maxAttempts) break;

      // Repli exponentiel + gigue aléatoire (évite que plusieurs
      // clients ne retentent tous exactement au même instant).
      const delay =
        options.baseDelayMs * 2 ** (attempt - 1) * (0.75 + Math.random() * 0.5);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Échec après plusieurs tentatives', { cause: lastError });
}
```

---

## 8. Ce que vous devez retenir

1. **`Promise<Promise<T>>` est syntaxiquement légal, sémantiquement
   impossible.** Les promesses s'aplatissent toujours, à n'importe quelle
   profondeur — verifié directement à l'exécution.
2. **Une promesse non traitée est une erreur qui disparaît en silence.**
   `no-floating-promises` (déjà actif dans ce dépôt) l'empêche à
   l'écriture.
3. **`all` / `allSettled` / `race` / `any` répondent à quatre questions
   différentes** — le mauvais choix produit un comportement correct en
   apparence, faux en production sous charge.
4. **`catch (e)` type `e` en `unknown`, jamais `any`** — narrowing par
   `instanceof Error` obligatoire avant tout accès.
5. **`AbortSignal.reason` est une brèche réelle du système de types**
   (`any`) — à traiter manuellement comme `unknown`.
6. **La concurrence non limitée n'est pas un détail de production** — un
   `Promise.all` sur une liste non bornée est un DoS que vous infligez à
   vos propres dépendances.

---

## 9. Auto-évaluation

1. Pourquoi `async function f(): Promise<Promise<number>> { return 42; }`
   compile-t-il, alors qu'aucune valeur ne peut jamais satisfaire ce type
   à l'exécution ? _(§1)_
2. Entre `Promise.all` et `Promise.allSettled`, laquelle choisiriez-vous
   pour envoyer un e-mail de notification à 50 utilisateurs, sans qu'un
   échec individuel n'empêche les 49 autres d'être notifiés ? _(§3)_
3. Pourquoi `signal.reason.message` ne produit-il **aucune erreur de
   compilation**, alors que rien ne garantit que `reason` soit une
   instance d'`Error` ? _(§5)_
4. Dans `mapWithConcurrency`, pourquoi `items[current]!` utilise-t-il une
   assertion non-nulle — et pourquoi est-ce, ici, l'un des rares cas
   justifiés malgré l'interdiction générale du module 11 ? _(§7 — indice :
   `current` est borné par construction, `noUncheckedIndexedAccess` ne
   peut pas le savoir statiquement)_
5. Réécrivez `retryWithBackoff` pour qu'il accepte un `AbortSignal` et
   abandonne immédiatement si celui-ci est déclenché pendant l'attente
   entre deux tentatives.

---

## Étape suivante

👉 [Module 13 — Tests, qualité, CI](../01-tests-qualite-ci/index.md)

Vous savez maintenant écrire de l'asynchrone fiable. Il reste à le
**prouver** — avec des tests qui vérifient le comportement, et d'autres
qui vérifient les types eux-mêmes.
