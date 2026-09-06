import { describe, expect, it } from 'vitest';

import { parseArgs } from '../src/commands.js';

describe('parseArgs', () => {
  it('parse "add <titre>"', () => {
    expect(parseArgs(['add', 'Acheter', 'du', 'café'])).toEqual({
      kind: 'add',
      title: 'Acheter du café',
    });
  });

  it('refuse "add" sans titre', () => {
    expect(parseArgs(['add'])).toEqual({
      kind: 'error',
      message: 'Usage : taskline add <titre>',
    });
  });

  it('parse "list"', () => {
    expect(parseArgs(['list'])).toEqual({ kind: 'list' });
  });

  it('parse "done <id>"', () => {
    expect(parseArgs(['done', 'abc-123'])).toEqual({ kind: 'done', id: 'abc-123' });
  });

  it('parse "remove <id>"', () => {
    expect(parseArgs(['remove', 'abc-123'])).toEqual({ kind: 'remove', id: 'abc-123' });
  });

  it('renvoie "help" sans argument', () => {
    expect(parseArgs([])).toEqual({ kind: 'help' });
  });

  it('renvoie une erreur pour une commande inconnue', () => {
    const result = parseArgs(['fly-to-the-moon']);
    expect(result.kind).toBe('error');
  });
});
