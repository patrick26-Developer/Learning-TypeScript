# Contribuer à TypeScript Atlas

Merci de l'intérêt porté à ce projet. Ce guide explique comment proposer une
correction, un exercice ou une traduction.

## Avant de commencer

```bash
git clone https://github.com/typescript-atlas/typescript-atlas.git
cd typescript-atlas
pnpm install
pnpm doctor
```

## Types de contributions bienvenues

| Type                               | Où                          | Exigence                                                   |
| ---------------------------------- | --------------------------- | ---------------------------------------------------------- |
| Correction de coquille             | `apps/site/docs/**`         | Aucune                                                     |
| Test incorrect ou ambigu           | `courses/**/tests/`         | Expliquer le désaccord dans la PR                          |
| Nouvel exercice                    | `courses/**`                | Énoncé + solution + tests + section « erreurs classiques » |
| Traduction anglaise                | `apps/site/i18n/en/**`      | Identifiants de code laissés en anglais                    |
| Correction de bug dans l'outillage | `scripts/**`, `packages/**` | Test de non-régression si pertinent                        |

## Avant d'ouvrir une pull request

```bash
pnpm verify:content
# = format:check → lint → typecheck → test:solutions
```

:::note Pourquoi `verify:content` et pas `verify` ?
`pnpm verify` (avec `test`, sans le `:content`) exécute les tests des
modules de cours **contre les exercices** — c'est la commande d'un
**apprenant** qui vérifie sa propre progression. Dans le dépôt tel qu'il est
committé, ces exercices sont **volontairement non résolus** : `pnpm verify`
y échoue en permanence, et ce n'est pas un bug.

`pnpm verify:content` exécute au contraire les tests des modules de cours
**contre les corrigés** (`test:solutions`) : c'est la commande qui vérifie
que **votre contribution** — un nouvel exercice, une correction de corrigé —
est correcte. C'est celle-ci que l'intégration continue exécutera (DT-05).
Voir AUD-014 dans le journal d'audit pour le détail de cette distinction.
:::

Si `pnpm verify:content` échoue chez vous, la contribution échouera en
intégration continue. Corrigez avant de la proposer.

## Convention de commit

Ce dépôt suit les [Conventional Commits](https://www.conventionalcommits.org/fr/) :

```text
feat: ajoute l'exercice 04 sur les types conditionnels
fix: corrige le test d'exhaustivité du module 07
docs: clarifie la section variance du module 04
refactor: simplifie le script pnpm doctor
chore: met à jour typescript-eslint vers 8.70
```

## Écrire un exercice

Structure attendue pour un nouvel exercice dans un module existant :

```text
courses/NN-nom-du-module/
├── exercises/NN-nom-exercice.ts                ← énoncé + squelette à compléter
├── solutions/NN-nom-exercice.ts                ← corrigé commenté
└── tests/
    ├── NN-nom-exercice.exercise.test.ts        ← cible exercises/ (rouge tant que non résolu — normal)
    └── NN-nom-exercice.solution.test.ts        ← cible solutions/ (DOIT toujours être vert)
```

Les deux fichiers de test contiennent typiquement les **mêmes assertions** —
seul l'import diffère (`../exercises/…` contre `../solutions/…`). C'est le
`test:solutions` du corrigé, jamais le `test` de l'exercice, qui doit passer
avant de proposer votre contribution (voir la section précédente).

Le corrigé doit inclure une section finale « Erreurs classiques » : au moins
deux erreurs typiques, avec le code fautif et pourquoi il échoue.

## Ajouter une décision d'architecture

Toute décision technique visible par les apprenants (choix de version, de
librairie, d'organisation) doit être consignée dans le
[journal d'audit](apps/site/docs/99-coulisses/01-journal-audit.md), avec :
statut, portée, réversibilité et justification.

## Code de conduite

Soyez respectueux. Les désaccords techniques sont bienvenus ; les attaques
personnelles ne le sont pas.
