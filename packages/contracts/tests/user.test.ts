import { describe, expect, it } from 'vitest';

import { UserSchema } from '../src/user.js';

describe('UserSchema', () => {
  it('accepte un utilisateur valide', () => {
    const result = UserSchema.safeParse({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      createdAt: '2026-09-05T10:00:00.000Z',
    });

    expect(result.success).toBe(true);
  });

  it('rejette une réponse malformée au lieu de la laisser passer silencieusement', () => {
    const result = UserSchema.safeParse({
      id: 'pas-un-uuid',
      email: 'pas-un-email',
      displayName: '',
      createdAt: 'hier',
    });

    expect(result.success).toBe(false);
  });
});
