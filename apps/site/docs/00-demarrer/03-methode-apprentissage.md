---
id: methode-apprentissage
slug: /methode-apprentissage
title: Méthode d'apprentissage
sidebar_label: Méthode d'apprentissage
sidebar_position: 3
description: Comment travailler ce parcours pour retenir durablement — rythme, répétition espacée, gestion de la difficulté.
---

# Méthode d'apprentissage

> Ce parcours peut être suivi de deux façons. L'une produit une impression de
> compétence en trois semaines. L'autre produit de la compétence en trois mois.
> Cette page décrit la seconde.

---

## 1. Le piège que tout le monde rencontre

Lire un cours de TypeScript est **agréable**. Tout paraît clair. On enchaîne
trois modules dans la soirée avec le sentiment d'avoir progressé.

Deux semaines plus tard, devant un vrai projet, plus rien ne vient.

La raison est connue et documentée : **la fluidité de lecture n'est pas de la
mémorisation.** Comprendre une explication et savoir la produire sont deux
compétences différentes, entraînées par deux activités différentes.

La conséquence pratique est simple et non négociable :

:::danger La règle des 70 / 30
**70 % de votre temps doit être passé à écrire du code, 30 % à lire.**

Si vous lisez plus que vous ne tapez, vous n'apprenez pas : vous vous divertissez.
:::

---

## 2. Le cycle par module

Chaque module se travaille en cinq passes. Comptez **4 à 12 heures** selon le module.

### Passe 1 — Survol _(10 min)_

Parcourez le module **sans chercher à comprendre**. Titres, encadrés, blocs de
code. Objectif : savoir ce qui vous attend. Le cerveau retient mieux ce qu'il a
déjà entrevu.

### Passe 2 — Lecture active _(1 à 2 h)_

Lisez pour de bon, **avec l'éditeur ouvert à côté**.

- Retapez les exemples. Ne les copiez pas : **tapez-les.**
- Après chaque exemple, **cassez-le volontairement**. Changez un type, retirez
  un `readonly`, remplacez `unknown` par `any`. Lisez l'erreur. C'est là que
  l'apprentissage a lieu.
- Notez vos questions sans les résoudre tout de suite.

### Passe 3 — Atelier _(2 à 6 h)_

Les exercices, dans l'ordre. **Sans ouvrir le corrigé.**

Bloqué depuis plus de 20 minutes sur un même exercice ? Alors seulement,
ouvrez le corrigé — puis appliquez le protocole du § 4.

### Passe 4 — Restitution _(20 min)_

Fermez tout. Sur une feuille ou dans un fichier vide, écrivez de mémoire :

- les 3 idées principales du module ;
- un exemple de code qui les illustre ;
- **le bug que ces notions permettent d'éviter.**

Cette passe est la plus inconfortable et **de très loin la plus efficace**.
Se souvenir renforce la mémoire ; relire ne la renforce presque pas.

### Passe 5 — Transfert _(variable)_

Le mini-projet en fin de bloc. C'est là que les notions cessent d'être
séparées et deviennent des outils.

---

## 3. La répétition espacée

Une notion vue une fois est une notion perdue. Le calendrier de révision est
intégré au parcours :

| Quand    | Quoi                                                                      | Durée  |
| -------- | ------------------------------------------------------------------------- | ------ |
| **J+1**  | Refaire _un_ exercice 🟡 du module de la veille, **sans relire le cours** | 15 min |
| **J+7**  | Relire l'antisèche du module + le quiz de fin                             | 10 min |
| **J+30** | Refaire un exercice 🔴 sur une feuille blanche                            | 30 min |

:::tip Le test infaillible
Vous maîtrisez une notion quand vous pouvez **l'expliquer à voix haute, avec un
exemple, sans regarder**. Tant que ce n'est pas le cas, ce n'est pas acquis —
quelle que soit l'impression de clarté ressentie à la lecture.
:::

---

## 4. Protocole d'utilisation d'un corrigé

Ouvrir un corrigé n'est pas un échec. **Le copier-coller en est un.**

1. Lisez le corrigé **en entier**, y compris la section « Pourquoi cette solution ».
2. Identifiez **la seule idée** qui vous manquait. Écrivez-la en une phrase.
3. **Fermez le corrigé.** Supprimez votre tentative.
4. Réécrivez la solution **de mémoire**, depuis une page blanche.
5. Comparez à nouveau. Les écarts restants sont vos vraies lacunes.

L'étape 3 est la seule qui compte. Sans elle, les quatre autres sont décoratives.

---

## 5. Rythmes recommandés

Choisissez **un** rythme et tenez-le. La régularité bat l'intensité.

### 🐢 Rythme régulier — 3 à 4 mois

`5 à 7 h par semaine` · **Le rythme recommandé pour la majorité des gens**

- 1 h les soirs de semaine (mardi, mercredi, jeudi)
- 2 à 3 h le week-end pour l'atelier et les projets
- 1 module par semaine environ

### 🐇 Rythme soutenu — 6 à 8 semaines

`15 à 20 h par semaine` · Reconversion, entre deux postes

- 3 h le matin (cours + atelier), 1 h le soir (révision)
- 2 à 3 modules par semaine
- ⚠️ Ne compressez **jamais** les modules 09, 10, 11 et 18 : ce sont les plus
  denses, et ce sont ceux qui font la différence.

### 🏃 Rythme intensif — 4 semaines

`35 h et plus par semaine` · Plein temps

Possible, mais soyez lucide : vous atteindrez la **couverture** du programme,
pas encore la **maîtrise**. Prévoyez impérativement un mois supplémentaire de
projets personnels derrière, sinon l'oubli fera son œuvre.

---

## 6. Comment savoir si vous progressez

Ces signaux sont fiables, contrairement au sentiment de compréhension :

- ✅ Vous **anticipez** l'erreur du compilateur avant de sauvegarder
- ✅ Vous lisez un message d'erreur long **sans stress**
- ✅ Vous écrivez le type **avant** l'implémentation, naturellement
- ✅ `any` vous met mal à l'aise
- ✅ Vous relisez votre ancien code et vous voyez ce qui ne va pas
- ✅ Vous savez **justifier** un choix de conception, pas seulement l'appliquer

---

## 7. Les six erreurs qui ruinent un parcours

| ❌ L'erreur                                 | ✅ Le correctif                           |
| ------------------------------------------- | ----------------------------------------- |
| Tout lire d'un trait sans coder             | Bloc de 45 min : 15 lire, 30 coder        |
| Ouvrir le corrigé au premier blocage        | Timer de 20 min, puis protocole du § 4    |
| Mettre `any` pour faire taire l'erreur      | Mettre `unknown` et affronter le problème |
| Sauter les modules « théoriques » (09, 10)  | Ce sont eux qui séparent junior et senior |
| Attendre de « tout savoir » pour construire | Commencer le projet à 60 % de maîtrise    |
| Désactiver une règle de lint qui gêne       | Comprendre _pourquoi_ elle existe d'abord |

---

## 8. Le contrat que vous passez avec vous-même

> Je code plus que je ne lis.
> Je laisse le compilateur me corriger sans me vexer.
> Je n'écris pas `any` pour aller plus vite.
> Je termine chaque bloc par son mini-projet.
> Je préfère un module compris à trois modules parcourus.

---

## Étape suivante

👉 [Orientation](./04-orientation-parcours.md) — trouvez **votre** point d'entrée.
