import { defineConfig } from 'vitest/config';

// ---------------------------------------------------------------------------
// Configuration de VÉRIFICATION DE CONTENU — jamais utilisée par un
// apprenant en train de résoudre l'exercice.
//
// POURQUOI CE FICHIER EXISTE (voir AUD-014 dans le journal d'audit) :
// les tests d'exercice (vitest.config.ts) ciblent délibérément un code qui
// N'EST PAS ENCORE ÉCRIT (`throw new Error('Not implemented')`) : ils sont
// rouges tant que l'exercice n'est pas résolu, et c'est le but recherché.
// Si le dépôt agrégeait ces mêmes tests comme critère de qualité du dépôt
// lui-même (`pnpm verify`), le dépôt fraîchement cloné échouerait TOUJOURS —
// ce n'est pas un défaut du dépôt, c'est un manuel non commencé.
//
// Cette configuration exécute plutôt les tests contre solutions/ : elle
// répond à la question « le corrigé que nous fournissons est-il correct ? »,
// la seule pertinente pour un contributeur ou une intégration continue.
// ---------------------------------------------------------------------------
export default defineConfig({
  test: {
    include: ['tests/**/*.solution.test.ts'],
    isolate: true,
  },
});
