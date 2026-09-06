import { describe, expect, it } from 'vitest';

import { matchPath } from '../src/match.js';

describe('matchPath', () => {
  it('extrait un seul paramètre', () => {
    expect(matchPath('/users/:id', '/users/42')).toEqual({ id: '42' });
  });

  it('extrait plusieurs paramètres', () => {
    expect(matchPath('/users/:id/posts/:postId', '/users/1/posts/7')).toEqual({
      id: '1',
      postId: '7',
    });
  });

  it('fait correspondre une route sans paramètre', () => {
    expect(matchPath('/health', '/health')).toEqual({});
  });

  it('renvoie null si le nombre de segments diffère', () => {
    expect(matchPath('/users/:id', '/users/1/extra')).toBeNull();
  });

  it('renvoie null si un segment littéral ne correspond pas', () => {
    expect(matchPath('/users/:id', '/products/1')).toBeNull();
  });

  it('décode les composants d’URL dans les valeurs de paramètres', () => {
    expect(matchPath('/search/:query', '/search/hello%20world')).toEqual({
      query: 'hello world',
    });
  });

  it('ignore les barres obliques de début/fin superflues', () => {
    expect(matchPath('/users/:id/', '/users/42')).toEqual({ id: '42' });
  });
});
