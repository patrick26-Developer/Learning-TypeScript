import { describe, expect, it } from 'vitest';

import { createTask, markDone, TaskStatus } from '../src/task.js';

describe('createTask', () => {
  it('crée une tâche todo avec un id et une date', () => {
    const task = createTask('Écrire les tests');

    expect(task.title).toBe('Écrire les tests');
    expect(task.status).toBe(TaskStatus.Todo);
    expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
  });
});

describe('markDone', () => {
  it('produit une NOUVELLE tâche, sans modifier l’originale', () => {
    const original = createTask('Réviser le module 03');
    const updated = markDone(original);

    expect(original.status).toBe(TaskStatus.Todo); // inchangée
    expect(updated.status).toBe(TaskStatus.Done);
    expect(updated.id).toBe(original.id);
    expect(updated).not.toBe(original); // référence différente
  });
});
