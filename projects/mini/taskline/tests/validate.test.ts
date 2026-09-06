import { describe, expect, it } from 'vitest';

import { validateTasks } from '../src/validate.js';

describe('validateTasks', () => {
  it('accepte un tableau de tâches valides', () => {
    const result = validateTasks([
      { id: 'a1', title: 'Première tâche', status: 'todo', createdAt: '2026-09-01T00:00:00.000Z' },
      { id: 'a2', title: 'Deuxième tâche', status: 'done', createdAt: '2026-09-02T00:00:00.000Z' },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
    }
  });

  it('rejette une racine qui n’est pas un tableau', () => {
    const result = validateTasks({ not: 'an array' });

    expect(result.ok).toBe(false);
  });

  it('rejette un status hors de l’union autorisée', () => {
    const result = validateTasks([
      { id: 'a1', title: 'X', status: 'in-progress', createdAt: '2026-09-01T00:00:00.000Z' },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toContain('"status"');
    }
  });

  it('rejette une date de création invalide', () => {
    const result = validateTasks([{ id: 'a1', title: 'X', status: 'todo', createdAt: 'hier' }]);

    expect(result.ok).toBe(false);
  });

  it('accumule TOUTES les erreurs plutôt que de s’arrêter à la première', () => {
    const result = validateTasks([
      { id: '', title: '', status: 'nope', createdAt: 'hier' },
      { id: 'ok', title: 'ok', status: 'todo', createdAt: '2026-09-01T00:00:00.000Z' },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    }
  });
});
