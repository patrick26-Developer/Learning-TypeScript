---
id: tests-qualite-ci
title: 'Module 13 — Tests, qualité, CI'
sidebar_label: 'M13 · Tests & CI'
sidebar_position: 2
description: Vitest 5, tester les types eux-mêmes avec expectTypeOf (et sa faille méconnue), tests basés sur les propriétés, couverture, tests d'intégration, et la chaîne complète format→lint→typecheck→test→build.
keywords:
  [
    typescript,
    vitest,
    tests,
    expectTypeOf,
    property-based testing,
    couverture,
    intégration continue,
  ]
---

# Module 13 — Tests, qualité, CI

|               |                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Durée**     | ≈ 8 heures                                                                                                        |
| **Prérequis** | [Module 12 — Asynchrone typé](../00-asynchrone-erreurs-concurrence/index.md)                                      |
| **Livrable**  | Une suite de tests qui vérifie le comportement **et** les types — sans se mentir sur ce qu'elle couvre réellement |

:::tip Ce module referme une boucle ouverte au module 00
Depuis le premier jour, ce parcours répète : _les types disparaissent à la
compilation, ils ne protègent rien à l'exécution_. Vitest propose un outil,
`expectTypeOf`, qui semble contredire cette règle — « tester un type »,
n'est-ce pas justement lui donner une existence à l'exécution ? La réponse,
vérifiée en direct dans ce module, est plus subtile — et plus importante
que prévu.
:::

---

## 1. Vitest 5 — configuration et organisation

Chaque paquet de ce dépôt possède son propre `vitest.config.ts` (module 01) :

```ts title="courses/02-systeme-de-types/vitest.config.ts"
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.exercise.test.ts'],
    isolate: true,
  },
});
```

`isolate: true` exécute chaque fichier de test dans son propre contexte :
un exercice raté ne peut jamais faire échouer un autre exercice par effet
de bord partagé (une variable de module, un mock non réinitialisé…).

### Doublures de test (`vi.fn`, `vi.mock`)

```ts
import { vi, expect, it } from 'vitest';

it('appelle le dépôt avec le bon identifiant', async () => {
  const findById = vi.fn().mockResolvedValue({ id: '1', name: 'Ada' });
  const repository = { findById };

  await getUser(repository, '1');

  expect(findById).toHaveBeenCalledWith('1'); // typé : erreur si l'appel n'existe pas
  expect(findById).toHaveBeenCalledTimes(1);
});
```

`vi.fn()` retourne une fonction factice **typée** d'après son usage :
`mockResolvedValue` exige une valeur compatible avec ce que la fonction
réelle doit retourner — une erreur de type ici signale un mock qui a
divergé du contrat qu'il est censé simuler.

---

## 2. Tester les types eux-mêmes — et la faille qui va avec

Un type est du code : il peut se tromper, régresser, être mal contraint.
`expectTypeOf` promet de le vérifier comme n'importe quelle valeur :

```ts
import { expectTypeOf, it } from 'vitest';

interface User {
  id: string;
  name: string;
}

function findUser(id: string): User | undefined {
  /* … */
}

it('findUser retourne User | undefined', () => {
  expectTypeOf(findUser).returns.toEqualTypeOf<User | undefined>();
});
```

Voici où ça devient intéressant.

:::danger Vérifié pendant la rédaction de ce module — une faille réelle, pas théorique
Le même test, avec une assertion **délibérément fausse** :

```ts
it('assertion FAUSSE, sans suppression', () => {
  // findUser retourne User | undefined, PAS seulement User.
  // Cette assertion est incorrecte.
  expectTypeOf(findUser).returns.toEqualTypeOf<User>();
});
```

```bash
$ npx vitest run
✓ 1 passed (1)
```

**Le test passe.** Aucune erreur, aucun avertissement. `expectTypeOf` ne
fait **rien** à l'exécution — son implémentation runtime est une coquille
vide ; toute sa valeur repose sur le fait que le **compilateur**, pas le
test-runner, refuse de compiler l'assertion si elle est fausse. Or
`vitest run`, par défaut, transforme les fichiers via **esbuild**
(module 01) — qui efface les types sans jamais les vérifier.

**Conséquence directe : si votre chaîne CI ne lance que `vitest run` sans
lancer `tsc` séparément, vos tests de types ne testent rien.** Ils sont
décoratifs — verts quoi qu'il arrive.
:::

C'est précisément pour cela que `pnpm verify` et `pnpm verify:content`
dans ce dépôt exécutent `typecheck` **et** `test` comme deux étapes
distinctes, jamais l'une à la place de l'autre (voir AUD-010 : les
fichiers de test sont inclus dans le `tsconfig` de chaque module de cours,
donc `pnpm typecheck` les couvre réellement). Un test de type n'a de valeur
que **combiné à un vrai passage du compilateur**.

Pour lancer les deux ensemble sans y penser :

```bash
pnpm typecheck && pnpm test
```

Vitest propose aussi un mode dédié (`vitest --typecheck`) qui délègue à
`tsc` en arrière-plan pour valider spécifiquement les fichiers
`*.test-d.ts` — une alternative à la double commande, au prix d'un
démarrage plus lent.

---

## 3. Tests basés sur les propriétés

Un test classique vérifie **un** exemple. Un test basé sur les propriétés
(_property-based testing_) vérifie qu'une **invariante** tient pour des
centaines d'entrées générées automatiquement — y compris des cas limites
qu'un humain n'aurait pas pensé à écrire.

```ts
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

describe('parseCsv (mini-projet 2)', () => {
  it('le nombre de lignes en sortie ne dépasse jamais le nombre de lignes en entrée', () => {
    fc.assert(
      fc.property(fc.array(fc.string()), (lines) => {
        const csv = lines.join('\n');
        const { rows, rowErrors } = parseCsv(csv, schema);
        expect(rows.length + rowErrors.length).toBeLessThanOrEqual(
          lines.length,
        );
      }),
    );
  });
});
```

`fc.property` décrit une **règle qui doit toujours être vraie**, pas un
résultat attendu précis. `fast-check` (version 4.9.0 au moment de la
rédaction) génère des centaines d'entrées aléatoires — chaînes vides,
caractères Unicode exotiques, tableaux vides — et **réduit
automatiquement** tout contre-exemple trouvé au cas le plus simple qui le
reproduit encore, plutôt que de vous laisser un exemple généré illisible.

:::note Honnêteté sur l'état de ce dépôt
`fast-check` n'est **pas encore** une dépendance installée dans ce
monorepo : l'exemple ci-dessus illustre le patron, il ne fait pas
(encore) partie de la suite de tests réelle de `csv-forge`. L'ajouter est
une contribution bienvenue — voir
[CONTRIBUTING.md](https://github.com/patrick26-Developer/Learning-TypeScript/blob/main/CONTRIBUTING.md).
:::

---

## 4. La couverture, lue intelligemment

```bash
pnpm --filter <paquet> test -- --coverage
```

Un pourcentage de couverture répond à **une seule question** : _quelles
lignes ont été exécutées au moins une fois ?_ — jamais à _le comportement
est-il correct ?_. Un test qui appelle une fonction sans vérifier son
résultat (`expect(true).toBe(true)`) produit 100 % de couverture et zéro
garantie.

:::warning Le piège classique
Viser un seuil de couverture (« 100 % obligatoire ») pousse à écrire des
tests qui _exécutent_ le code sans le _vérifier_ — la couverture monte, la
confiance réelle n'augmente pas. Un seuil raisonnable (souvent 80–90 %)
combiné à une revue humaine des zones non couvertes vaut mieux qu'un
100 % obtenu en trichant sur la qualité des assertions.
:::

La couverture est un **détecteur d'angles morts** (« ce fichier n'est
jamais exécuté par aucun test — pourquoi ? »), pas un objectif en soi.

---

## 5. Tests d'intégration sur base jetable

Un test unitaire isole une fonction ; un test d'intégration vérifie que
plusieurs couches réelles collaborent correctement — typiquement, le code
d'accès aux données face à une **vraie** base de données, jamais un mock
de base (un mock ne peut pas reproduire une contrainte d'unicité, un
verrou, ou le comportement réel d'une transaction).

Ce dépôt fournit déjà l'infrastructure nécessaire (module 14 l'exploite en
détail) :

```bash
docker compose -f infra/docker/compose.test.yaml up -d
pnpm --filter <paquet-avec-base> test:integration
docker compose -f infra/docker/compose.test.yaml down -v
```

`compose.test.yaml` démarre une base **en mémoire**, jetable, isolée du
`compose.dev.yaml` utilisé au quotidien : chaque exécution de la suite de
tests démarre sur un état parfaitement connu, jamais pollué par une
exécution précédente.

---

## 6. La chaîne complète : `format → lint → typecheck → test → build`

Cinq étapes, dans cet ordre précis, et l'ordre n'est pas arbitraire :

| Étape       | Répond à                                                          | Coût si sautée                                                  |
| ----------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `format`    | Le style est-il cohérent ?                                        | Diffs Git bruités, revues de code polluées                      |
| `lint`      | Le code est-il prudent ?                                          | Promesses flottantes, `any` qui se propagent (module 04)        |
| `typecheck` | Les types sont-ils cohérents — **y compris les `expectTypeOf`** ? | Voir §2 : sans cette étape, les tests de types ne prouvent rien |
| `test`      | Le comportement est-il correct ?                                  | Régressions fonctionnelles non détectées                        |
| `build`     | Le tout s'assemble-t-il pour de vrai ?                            | Erreurs qui n'apparaissent qu'en production                     |

Ce dépôt expose déjà cette chaîne sous deux formes distinctes — voir
[AUD-014](../../99-coulisses/01-journal-audit.md) pour la raison de cette
séparation :

```bash
pnpm verify          # apprenant : teste VOS exercices
pnpm verify:content   # contributeur : teste les CORRIGÉS
```

:::info Dette technique reconnue
Cette chaîne s'exécute aujourd'hui **manuellement**, en local. Sa
version automatisée en intégration continue (un workflow GitHub Actions
qui la lance à chaque pull request) est encore à écrire — voir **DT-05**
dans le journal d'audit. Le module 14 la met en place, aux côtés de
Docker.
:::

---

## 7. Ce que vous devez retenir

1. **`vi.fn()` produit des doublures typées** — un mock qui diverge du
   contrat réel devient une erreur de compilation, pas une surprise à
   l'exécution.
2. **`expectTypeOf` ne vérifie RIEN par lui-même à l'exécution.** Sa
   validité dépend entièrement d'un vrai passage par `tsc` — vérifié en
   direct : un test de type faux, non suppressé, passe silencieusement
   sous `vitest run` seul.
3. **Un test basé sur les propriétés vérifie une règle, pas un exemple** —
   il trouve des cas limites qu'on n'aurait pas pensé à écrire, et les
   réduit au plus simple contre-exemple possible.
4. **La couverture mesure l'exécution, jamais la vérification.** Un seuil
   n'est utile que combiné à des assertions réellement exigeantes.
5. **Un test d'intégration a besoin d'une vraie base, jetable** — un mock
   de base de données ne peut pas reproduire ses vraies contraintes.
6. **`format → lint → typecheck → test → build` est un ordre, pas une
   liste** — sauter `typecheck` rend `expectTypeOf` inutile ; sauter
   `build` laisse passer des erreurs qui n'existent qu'à l'assemblage.

---

## 8. Auto-évaluation

1. Pourquoi un test contenant une assertion `expectTypeOf` fausse peut-il
   passer avec succès sous `vitest run`, alors que `pnpm typecheck`
   détecterait immédiatement le même problème ? _(§2)_
2. Un projet exécute uniquement `vitest run` en intégration continue, sans
   jamais lancer `tsc --noEmit` séparément. Que peut-on en déduire sur la
   fiabilité réelle de ses tests `expectTypeOf` ? _(§2)_
3. Pourquoi `fc.property` décrit-il une **règle** plutôt qu'un résultat
   attendu précis — et en quoi cela le rend-il capable de trouver des bugs
   qu'un test classique manquerait ? _(§3)_
4. Un test d'intégration utilise un mock de base de données au lieu d'une
   vraie base. Citez un bug qu'un tel mock ne pourrait structurellement
   jamais détecter. _(§5)_
5. Pourquoi `typecheck` doit-il s'exécuter **avant** `test`, et jamais
   l'inverse, dans une chaîne de vérification cohérente ? _(§6)_

---

## Étape suivante

👉 **Module 14 — Docker & industrialisation**
_(en cours de rédaction)_

Vous savez maintenant prouver qu'un programme se comporte correctement —
y compris ses types. Il reste à le rendre **reproductible** : la même
image, le même comportement, chez vous comme en production.
