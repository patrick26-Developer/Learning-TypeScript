<div align="center">

<img src="apps/site/static/img/logo.svg" width="88" alt="TypeScript Atlas" />

# TypeScript Atlas

**Formation TypeScript complète, de A à Z — du premier `let` à l'architecture d'API de production.**

Théorie · Exercices corrigés · Mini-projets · APIs NestJS & Express · Docker · 3 projets finaux
Bilingue 🇫🇷 / 🇬🇧 · Gratuit · Code sous MIT, contenu sous CC BY-SA 4.0

</div>

---

## Ce que c'est

Un dépôt que vous clonez et qui fonctionne. **21 modules**, **6 mini-projets** et
**3 applications finales**, conçus pour amener une personne débutante à un
niveau professionnel solide — et pour permettre à une personne expérimentée de
combler ses angles morts.

La particularité tient en une phrase : **le code des cours n'est pas dans le
Markdown.** Ce sont de vrais paquets du monorepo, qui passent `typecheck`,
`lint` et `test` en intégration continue. Si une leçon devient fausse, le build
casse.

---

## Démarrage

```bash
git clone https://github.com/patrick26-Developer/Learning-TypeScript.git
cd Learning-TypeScript
pnpm install
pnpm doctor      # vérifie votre environnement
pnpm site:dev    # → http://localhost:3000
```

**Prérequis :** Node ≥ 22.12 · pnpm ≥ 10 · Git.
Docker devient nécessaire à partir du module 14.
Guide complet : [`/installation`](apps/site/docs/00-demarrer/06-installation.md)

---

## Par où commencer

| Votre profil                           | Votre point d'entrée                                 |
| -------------------------------------- | ---------------------------------------------------- |
| 🌱 Débutant complet                    | Module 00, dans l'ordre, sans rien sauter            |
| 🔵 Développeur JavaScript              | Modules 00–04 en accéléré, puis 05 → 11              |
| 🟣 Vous venez de Java / C# / Go / Rust | Module 00 obligatoire, puis 05, 07, 10, 11           |
| 🟠 Vous utilisez déjà TypeScript       | Modules 09, 10, 11, puis 14 et 18                    |
| 🔴 Vous visez un poste senior          | Modules 10, 11, 14–18, 20 + les trois projets finaux |

Auto-évaluation en 10 questions et parcours détaillés :
[`/orientation-parcours`](apps/site/docs/00-demarrer/04-orientation-parcours.md)

---

## Le programme

| Partie  | Modules   | Contenu                                                   | Projet                           |
| ------- | --------- | --------------------------------------------------------- | -------------------------------- |
| **I**   | M00 → M04 | Origines, toolchain, système de types, fonctions          | `taskline` — CLI sans dépendance |
| **II**  | M05 → M08 | Interfaces, génériques, narrowing, modules                | `csv-forge` — parseur typé       |
| **III** | M09 → M11 | Types conditionnels, `infer`, branded types, **sécurité** | `typed-router`                   |
| **IV**  | M12 → M14 | Asynchrone, tests, **Docker & CI**                        | `atlas-sdk`                      |
| **V**   | M15 → M18 | Express 5, Prisma, NestJS 12, API de production           | API + microservice               |
| **VI**  | M19 → M20 | React 19 typé, contrats partagés                          | **NEXUS · PULSE · TRAIL**        |

Programme détaillé : [`/plan-de-formation`](apps/site/docs/00-demarrer/01-plan-de-formation.md)

### Les trois projets finaux

| Projet    | Stack                                                         | Ce qu'il démontre                                    |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| **NEXUS** | Next.js 16 · NestJS 12 · PostgreSQL · Prisma · Redis · Docker | Web rendu serveur, auth, rôles, temps réel           |
| **PULSE** | React 19 · Vite 8 · Express 5 · WebSocket · Redis             | Monopage temps réel, performance, hors-ligne         |
| **TRAIL** | React Native · Expo 57 · SQLite                               | Mobile hors-ligne d'abord, synchronisation, conflits |

Les trois consomment le **même paquet `@atlas/contracts`** : modifier un champ
du contrat casse la compilation des trois clients.

---

## Structure du dépôt

```text
typescript-atlas/
├── apps/site/            Site Docusaurus bilingue (FR source, EN traduit)
│   ├── docs/             Contenu des cours en français
│   ├── i18n/en/          Traduction anglaise
│   └── src/              Page d'accueil et composants
├── courses/              Le CODE des cours : exercices, solutions, tests
│   └── NN-nom/
│       ├── exercises/    ← vous écrivez ici
│       ├── solutions/    ← le corrigé
│       └── tests/        ← ne pas modifier
├── projects/
│   ├── mini/             Les 6 mini-projets guidés
│   └── capstones/        NEXUS · PULSE · TRAIL
├── packages/
│   ├── tsconfig/         Configurations TypeScript partagées
│   ├── eslint-config/    Lint type-aware partagé
│   └── contracts/        Contrats d'API partagés end-to-end
├── labs/ts7-native/      Laboratoire TypeScript 7 (compilateur Go), isolé
├── infra/docker/         Dockerfiles et docker compose
└── scripts/              Outillage de maintenance du dépôt
```

---

## Commandes

| Commande                                    | Effet                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm doctor`                               | Diagnostic de l'environnement                                                              |
| `pnpm site:dev`                             | Site de formation en local                                                                 |
| `pnpm verify`                               | `format:check` → `lint` → `typecheck` → `test`                                             |
| `pnpm test`                                 | Tous les tests                                                                             |
| `pnpm --filter @atlas/course-07 test:watch` | Tests d'un module en continu                                                               |
| `pnpm verify:content`                       | Vérification pour contributeurs — teste les **corrigés**, pas les exercices (voir AUD-014) |
| `pnpm compare 07 03`                        | Votre solution face au corrigé                                                             |
| `pnpm audit:deps`                           | Vulnérabilités connues                                                                     |
| `pnpm clean`                                | Suppression des artefacts                                                                  |

---

## Choix techniques

Ce dépôt applique le niveau de rigueur qu'il enseigne.

- **TypeScript 6.0.3** en configuration stricte maximale —
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `noImplicitOverride` inclus.
- **Lint type-aware** (`strictTypeChecked`) — vérifié par une sonde à défauts
  délibérés, pas simplement supposé fonctionnel.
- **pnpm avec `hoist=false`** — les dépendances fantômes sont structurellement
  impossibles.
- **Liens morts = build en échec** — un lien cassé interrompt un apprentissage.
- **TypeScript 7 en laboratoire isolé** — l'outillage de lint ne le supporte pas
  encore ; la décision est datée et sera réexaminée.

Chaque décision est consignée, justifiée et **contestable** dans le
[journal d'audit](apps/site/docs/99-coulisses/01-journal-audit.md) — qui
recense également la dette technique assumée.

---

## Contribuer

Coquilles, énoncés ambigus, tests discutables, traductions : tout est bienvenu.
Voir [CONTRIBUTING.md](CONTRIBUTING.md).

Avant toute proposition :

```bash
pnpm verify
```

---

## Licences

| Élément                                         | Licence                         |
| ----------------------------------------------- | ------------------------------- |
| Code (exercices, solutions, projets, outillage) | [MIT](LICENSE)                  |
| Contenu pédagogique (cours, guides)             | [CC BY-SA 4.0](LICENSE-CONTENT) |
