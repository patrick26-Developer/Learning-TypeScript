---
slug: lancement
title: 'Lancement : le squelette complet est en ligne'
authors: []
tags: [annonce, architecture]
date: 2026-09-05
---

Le dépôt **TypeScript Atlas** est ouvert. Cette première publication ne contient
pas encore les 21 modules — elle contient ce qui les rendra possibles : le socle
technique, le programme complet, les guides d'accompagnement et le journal
d'audit.

<!-- truncate -->

## Ce qui est disponible aujourd'hui

- **Le programme complet** — 21 modules, 6 mini-projets, 3 projets finaux,
  détaillés module par module avec objectifs et durées.
- **Les guides d'accompagnement** — guide d'utilisation, méthode
  d'apprentissage, cinq parcours d'orientation, consignes de travail,
  installation pas à pas et FAQ.
- **Le module 00** — Origines et philosophie de TypeScript.
- **Le socle technique** — monorepo pnpm, TypeScript en configuration stricte
  maximale, lint type-aware vérifié, site bilingue.
- **Le journal d'audit** — neuf décisions d'architecture datées et justifiées,
  ainsi que six éléments de dette technique assumés.

## Une décision qui mérite explication

Au moment de figer les versions, `typescript@7.0.2` était disponible : la
réécriture native du compilateur en Go, nettement plus rapide.

Nous ne l'avons pas retenue. `typescript-eslint` — l'outil qui fournit le lint
type-aware, et donc la détection des promesses non attendues et de la
propagation des `any` — déclare la contrainte `typescript >=4.8.4 <6.1.0`.
Adopter TypeScript 7 aujourd'hui reviendrait à **retirer une brique
pédagogique centrale pour gagner du temps de compilation**.

Le socle est donc **TypeScript 6.0.3**, et TypeScript 7 est traité dans un
laboratoire isolé, avec guide de migration et date de réexamen fixée au
1er décembre 2026.

C'est exactement le type d'arbitrage qu'on rencontre en entreprise. Autant
l'enseigner sur un cas réel plutôt que sur un exemple inventé.

## Ce qui arrive ensuite

Les modules sont publiés par blocs, chacun accompagné de ses exercices, de ses
corrigés commentés et de ses tests. La traduction anglaise suit la publication
française.

Le [journal d'audit](/coulisses/journal-audit) reste le document de référence :
tout ce qui manque encore y est listé explicitement.
