import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ne cible QUE les tests d'exercice — ceux qui pointent vers
    // exercises/, le code que l'apprenant complète. Le corrigé a sa
    // propre configuration : voir vitest.solutions.config.ts et AUD-014
    // dans le journal d'audit.
    include: ['tests/**/*.exercise.test.ts'],
    // Chaque test doit s'exécuter isolément : un exercice raté ne doit
    // jamais faire échouer les tests d'un autre exercice par effet de bord.
    isolate: true,
  },
});
