---
id: faq
slug: /faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 7
description: Les questions les plus fréquentes sur la formation TypeScript Atlas — prérequis, durée, outils, débouchés.
---

# Questions fréquentes

## Sur la formation

<details>
<summary><strong>Faut-il savoir programmer avant de commencer ?</strong></summary>

Il faut savoir **un minimum de JavaScript**. TypeScript n'est pas un langage
séparé : c'est JavaScript augmenté de types. On ne peut pas apprendre les types
d'un langage qu'on ne sait pas lire.

Le seuil concret : savoir écrire une fonction, une boucle, manipuler un tableau
et un objet, et comprendre `async`/`await` au moins de loin.

Si ce n'est pas le cas, le [module 00](../01-fondations/00-origines/index.md)
liste précisément ce qu'il faut réviser et où. Comptez 2 à 3 semaines
supplémentaires — elles ne sont pas perdues.

</details>

<details>
<summary><strong>Combien de temps faut-il réellement ?</strong></summary>

**120 à 160 heures de travail effectif** pour le parcours complet.

Traduit en calendrier :

- 5–7 h/semaine → **3 à 4 mois**
- 15–20 h/semaine → **6 à 8 semaines**
- Temps plein → **4 semaines** pour la couverture, mais pas encore la maîtrise

Ces chiffres supposent que vous _codez_. Si vous vous contentez de lire, divisez
le temps par trois — et la compétence acquise par dix.

</details>

<details>
<summary><strong>Dois-je faire les trois projets finaux ?</strong></summary>

Non. **Un seul suffit** pour la majorité des objectifs.

- Vous visez le **web full-stack** → NEXUS (Next.js + NestJS)
- Vous visez le **frontend** → PULSE (React + Vite)
- Vous visez le **mobile** → TRAIL (React Native + Expo)
- Vous visez un poste **senior / lead** → les trois, pour la démonstration du
  contrat partagé de bout en bout

</details>

<details>
<summary><strong>Le contenu est-il vraiment gratuit ?</strong></summary>

Oui. Le contenu pédagogique est sous licence **CC BY-SA 4.0**, le code sous
licence **MIT**. Vous pouvez l'utiliser, le modifier, l'enseigner — y compris
en contexte professionnel — à condition de citer la source et de partager les
dérivés du contenu sous la même licence.

</details>

<details>
<summary><strong>Y a-t-il un certificat ?</strong></summary>

Non, et c'est délibéré. Un certificat auto-délivré n'a aucune valeur sur le
marché.

Ce qui en a : **un dépôt public contenant vos trois projets, avec un historique
Git réel et un README qui explique vos décisions d'architecture.** C'est ce
qu'un recruteur technique regarde. C'est exactement ce que ce parcours vous fait
produire.

</details>

---

## Sur TypeScript

<details>
<summary><strong>TypeScript va-t-il disparaître au profit du typage natif de JavaScript ?</strong></summary>

Non, et la question mérite d'être précisée.

La proposition ECMAScript **« Types as Comments »** vise à permettre à JavaScript
d'_ignorer_ les annotations de type, pour qu'un fichier typé s'exécute sans
transpilation. Node 22+ le fait déjà via `--experimental-strip-types`.

Mais cette proposition ne fournit **aucune vérification** : elle rend les types
syntaxiquement légaux, pas sémantiquement contrôlés. Le vérificateur — c'est-à-dire
TypeScript — reste indispensable. En pratique, cette évolution _renforce_
TypeScript au lieu de le remplacer.

</details>

<details>
<summary><strong>Pourquoi la formation utilise TypeScript 6 alors que la 7 est sortie ?</strong></summary>

Décision d'architecture assumée, et documentée dans le
[journal d'audit](../99-coulisses/01-journal-audit.md).

TypeScript 7 est la réécriture native (en Go) du compilateur : elle est
spectaculairement plus rapide. Mais à ce jour, `typescript-eslint` — l'outil qui
fournit le **lint type-aware**, pilier des modules 11 et 13 — déclare la
contrainte `typescript <6.1.0`. L'adopter reviendrait à sacrifier une brique
pédagogique centrale pour gagner du temps de compilation.

Nous enseignons donc sur **TypeScript 6.0.3** (stable, entièrement outillé),
et TypeScript 7 est traité dans un **laboratoire dédié** (`labs/ts7-native`)
avec un guide de migration. Le jour où l'écosystème suit, la bascule est
préparée — c'est exactement ainsi qu'on gère une montée de version en entreprise.

</details>

<details>
<summary><strong>Faut-il apprendre React avant ce parcours ?</strong></summary>

Non pour les modules 00 à 18 : ils sont purement TypeScript et backend.

Oui, un minimum, pour le module 19 et les projets finaux. Une connaissance de
base de React (composants, props, `useState`, `useEffect`) suffit — la
formation apporte tout le typage.

</details>

<details>
<summary><strong>Express ou NestJS : lequel dois-je apprendre ?</strong></summary>

**Les deux, et dans cet ordre.**

Express vous montre les mécanismes : ce qu'est un middleware, comment une
requête traverse le système, ce que vous devez construire vous-même.

NestJS vous montre ce qu'un framework structurant apporte — et **son coût**.
Vous ne pouvez pas juger honnêtement de ce coût si vous n'avez jamais assemblé
les pièces à la main.

Le module 17 se termine par une comparaison argumentée, avec les critères de
choix réels : taille d'équipe, durée de vie du projet, besoin d'homogénéité.

</details>

<details>
<summary><strong>Faut-il vraiment activer toutes les options strictes ?</strong></summary>

Sur un nouveau projet : **oui, sans hésitation**. Le coût d'activation est nul
au début et prohibitif après deux ans de code.

Sur un projet existant : non, pas d'un coup. Le module 11 détaille une
stratégie de durcissement progressif, option par option, fichier par fichier,
sans bloquer les livraisons de l'équipe.

</details>

---

## Sur l'outillage

<details>
<summary><strong>Puis-je utiliser npm ou yarn au lieu de pnpm ?</strong></summary>

Techniquement oui, mais **ce n'est pas supporté ici**, et deux choses casseront :

1. Les protocoles `workspace:*` entre paquets internes.
2. L'isolement de `node_modules`, sur lequel s'appuie le module 08 pour vous
   faire _voir_ le problème des dépendances fantômes.

pnpm s'installe en une commande (`corepack enable`). C'est le chemin le plus court.

</details>

<details>
<summary><strong>Docker est-il obligatoire ?</strong></summary>

Pas avant le module 14. Ensuite, oui — pour PostgreSQL, Redis et les tests
d'intégration.

Une alternative existe (PostgreSQL installé localement) et est documentée, mais
elle vous prive d'une compétence explicitement demandée dans presque toutes les
offres d'emploi backend actuelles. Le module 14 est court et il est rentable.

</details>

<details>
<summary><strong>Puis-je utiliser WebStorm / Neovim / autre chose que VS Code ?</strong></summary>

Oui. Rien dans le dépôt n'est spécifique à VS Code : ESLint, Prettier,
TypeScript et Vitest s'exécutent en ligne de commande.

Seuls les fichiers de confort (`.vscode/`) sont fournis pour VS Code. Si vous
utilisez autre chose, assurez-vous simplement que votre éditeur utilise **le
TypeScript du projet** et non le sien.

</details>

<details>
<summary><strong>Pourquoi ESLint est-il si lent ?</strong></summary>

Parce qu'il est configuré en mode **type-aware** : il charge le vérificateur de
types complet pour pouvoir détecter des promesses non attendues ou des `any` qui
se propagent. Un lint purement syntaxique serait instantané — et incapable de
trouver ces bugs.

C'est un choix : on préfère 90 secondes en intégration continue à un incident
en production. Vous pouvez toujours cibler un seul paquet en local avec
`--filter`.

</details>

---

## Contribuer

<details>
<summary><strong>J'ai trouvé une erreur. Que faire ?</strong></summary>

Ouvrez un ticket avec : le **module**, le **fichier**, ce que vous **attendiez**,
ce qui **s'est passé**, et la sortie de `pnpm doctor`.

Les corrections sont consignées dans le
[journal d'audit](../99-coulisses/01-journal-audit.md), datées et justifiées.

</details>

<details>
<summary><strong>Puis-je proposer un exercice ou une traduction ?</strong></summary>

Oui, les deux sont bienvenus. Un exercice doit fournir : l'énoncé, la solution,
les tests, et une section « erreurs classiques ». Une traduction doit conserver
les identifiants de code en anglais.

</details>
