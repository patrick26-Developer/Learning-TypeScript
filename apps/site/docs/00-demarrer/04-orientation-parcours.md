---
id: orientation-parcours
slug: /orientation-parcours
title: Orientation — quel parcours pour vous ?
sidebar_label: Orientation
sidebar_position: 4
description: Cinq parcours selon votre profil et votre objectif — débutant complet, développeur JS, développeur d'un autre langage, mise à niveau senior, préparation entretien.
---

# Orientation — quel parcours pour vous ?

Ce programme est vaste. **Le suivre linéairement n'est pas toujours le bon
choix.** Cette page vous place au bon endroit dès le premier jour.

---

## Auto-évaluation en 60 secondes

Répondez honnêtement. Personne ne vous regarde, et vous tricher ici ne vous
coûterait que du temps.

1. Je sais expliquer la différence entre `null` et `undefined` en JavaScript.
2. Je sais ce que fait `Array.prototype.map` sans consulter la documentation.
3. Je comprends `async`/`await` et je sais ce qu'est une promesse rejetée.
4. Je sais ce que signifie `strictNullChecks`.
5. J'ai déjà écrit une fonction générique avec une contrainte `extends`.
6. Je sais ce qu'est une union discriminée et pourquoi c'est utile.
7. Je sais ce que fait `infer` dans un type conditionnel.
8. Je sais pourquoi un type TypeScript ne protège pas une réponse d'API.
9. J'ai déjà conçu une API REST versionnée et authentifiée en production.
10. Je sais expliquer pourquoi `exactOptionalPropertyTypes` existe.

| Réponses « oui » | Votre parcours                                            |
| ---------------- | --------------------------------------------------------- |
| 0 – 2            | 🌱 [Parcours A — Débutant complet](#a)                    |
| 3 – 4            | 🔵 [Parcours B — Développeur JavaScript](#b)              |
| 5 – 6            | 🟣 [Parcours C — Développeur d'un autre langage typé](#c) |
| 7 – 8            | 🟠 [Parcours D — Mise à niveau expert](#d)                |
| 9 – 10           | 🔴 [Parcours E — Architecture & entretiens](#e)           |

---

## 🌱 Parcours A — Débutant complet {#a}

**Vous êtes ici si :** vous débutez en programmation, ou vous connaissez un peu
de JavaScript sans être à l'aise.

**Durée réaliste : 4 à 5 mois** à 5–7 h par semaine.

:::warning Une étape préalable, et elle est non négociable
TypeScript **est** JavaScript, avec des types en plus. On ne peut pas apprendre
le second sans le premier. Si les réponses 1, 2 et 3 de l'auto-évaluation sont
« non », consacrez 2 à 3 semaines aux fondamentaux JavaScript avant de commencer.
Le [module 00](../01-fondations/00-origines/index.md) vous indique exactement
quoi réviser et où.
:::

**Votre trajet :** tous les modules, **dans l'ordre, sans exception.**

```text
M00 → M01 → M02 → M03 → M04 → 🛠️ taskline
M05 → M06 → M07 → M08 → 🛠️ csv-forge
M09 → M10 → M11 → 🛠️ typed-router
M12 → M13 → M14 → 🛠️ atlas-sdk
M15 → M16 → M17 → M18 → 🛠️ API + microservice
M19 → M20 → 🏛️ UN projet final (commencez par PULSE)
```

**Règles spécifiques à ce parcours :**

- Ne sautez **aucun** exercice 🟢. Ce sont vos fondations.
- Les exercices 🔴 sont optionnels au premier passage — revenez-y à J+30.
- Ralentissez sur les modules 06 et 09 : ce sont les deux marches les plus hautes.
- **Un seul projet final** suffit largement. Trois, c'est pour le parcours E.

---

## 🔵 Parcours B — Développeur JavaScript {#b}

**Vous êtes ici si :** vous êtes à l'aise en JS moderne mais TypeScript vous
semble une contrainte plus qu'un outil.

**Durée réaliste : 2 à 3 mois.**

**Votre trajet :**

```text
M00 (lecture rapide — mais lisez-le : il explique les bizarreries)
M01 → M02 → M03 → M04   ⏩ en accéléré, faites surtout les 🟡
M05 → M06 → M07 → M08   ⏸️ à vitesse normale, c'est votre vrai départ
M09 → M10 → M11         🛑 cœur de votre montée en compétence
M12 → M13 → M14
M15 → M16 → (M17 si vous visez le backend)
M19 → 🏛️ NEXUS ou PULSE
```

**Le piège de votre profil :** écrire du JavaScript avec des annotations,
au lieu d'écrire du TypeScript. Symptômes : beaucoup de `as`, des `any` dans
les cas difficiles, des types qui décrivent le code au lieu de le contraindre.
**Les modules 07, 10 et 11 sont votre traitement.**

---

## 🟣 Parcours C — Développeur d'un autre langage typé {#c}

**Vous êtes ici si :** vous venez de Java, C#, Go, Rust, Kotlin, Swift…

**Durée réaliste : 6 à 10 semaines.**

:::info Votre atout et votre handicap
Vous comprenez déjà les génériques, les interfaces, la variance. **Mais** vous
allez instinctivement chercher du typage **nominal** — or TypeScript est
**structurel**. Vous chercherez aussi une garantie à l'exécution : il n'y en a
aucune. Ces deux malentendus sont traités frontalement aux modules 00, 05 et 11.
:::

**Votre trajet :**

```text
M00 (⚠️ obligatoire — c'est là que vos réflexes sont recalibrés)
M01 → M02 (rapide)
M03 → M04 → M05 (⚠️ typage structurel : lisez lentement)
M06 (rapide) → M07 (⚠️ unions discriminées : n'existe pas dans votre langage)
M08 → M09 → M10 (le système de types de TS est plus expressif que celui
                  dont vous venez : ne le sous-estimez pas)
M11 (⚠️ obligatoire — la validation runtime n'est pas optionnelle ici)
M12 → M13 → M14 → M15 → M17 (NestJS vous paraîtra familier : c'est voulu)
M18 → 🏛️ NEXUS
```

---

## 🟠 Parcours D — Mise à niveau expert {#d}

**Vous êtes ici si :** vous utilisez TypeScript quotidiennement depuis des
années, efficacement, mais vous sentez un plafond.

**Durée réaliste : 4 à 6 semaines.**

**Votre trajet — allez droit au but :**

```text
M02 §satisfies · M03 §enum · M04 §variance   (comblez les angles morts)
M09 → M10 → M11   🛑 le cœur de votre montée en niveau
M12 (concurrence, annulation, streams)
M13 (tests de types, property-based)
M14 → M18   🛑 sécurité et scalabilité
M20 (contrats partagés end-to-end)
🏛️ Les trois projets finaux, ou un seul mené jusqu'à la production
```

**Test d'entrée honnête.** Si vous ne pouvez pas répondre à ces trois questions
sans documentation, le parcours D est bien pour vous :

1. Pourquoi `Pick<T, K>` nécessite-t-il `K extends keyof T` ?
2. Que produit `type A = 'a' | 'b' extends string ? 1 : 2` et **pourquoi** ?
3. Quelle différence de comportement entre `{ a?: string }` et
   `{ a: string | undefined }` sous `exactOptionalPropertyTypes` ?

---

## 🔴 Parcours E — Architecture & entretiens {#e}

**Vous êtes ici si :** vous maîtrisez le langage et visez un poste senior,
lead ou architecte.

**Durée réaliste : 4 à 8 semaines**, orientées production.

**Votre trajet :**

```text
M10 (types au service du domaine métier)
M11 (sécurité, fiabilité, chaîne d'approvisionnement)
M14 (Docker, CI/CD)
M15 vs M17   🛑 savoir ARGUMENTER le choix Express / NestJS
M16 (inversion de dépendance, transactions, performance)
M18 (auth, RBAC, observabilité, cache, scalabilité)
M20 (frontières de monorepo, versionnement, DX)
🏛️ LES TROIS projets finaux, avec le contrat partagé
📋 Annexe « Préparation entretien » : 120 questions
📋 Annexe « Journal d'audit » : lisez les ADR, contestez-les
```

**Votre livrable :** ne visez pas la complétion. Visez **un dépôt public que
vous pouvez défendre en entretien pendant 45 minutes**, décisions
d'architecture comprises.

---

## Vous hésitez encore ?

Prenez le **parcours B** et ajustez. Il est conçu pour être le plus tolérant :
assez rapide pour ne pas ennuyer, assez complet pour ne rien laisser de côté.

---

## Étape suivante

👉 [Consignes de travail](./05-consignes.md) — les règles du jeu.
