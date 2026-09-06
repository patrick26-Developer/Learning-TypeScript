import { describe, expect, it, vi } from 'vitest';

import { Router } from '../src/router.js';

describe('Router', () => {
  it('déduit et transmet les paramètres typés à la volée', () => {
    const router = new Router();
    const handler = vi.fn();

    router.get('/users/:id/posts/:postId', handler);
    const handled = router.dispatch('GET', '/users/1/posts/7');

    expect(handled).toBe(true);
    expect(handler).toHaveBeenCalledWith({ id: '1', postId: '7' });
  });

  it('distingue les méthodes HTTP pour un même chemin', () => {
    const router = new Router();
    const onGet = vi.fn();
    const onPost = vi.fn();

    router.get('/users/:id', onGet);
    router.post('/users/:id', onPost);

    router.dispatch('POST', '/users/1');

    expect(onGet).not.toHaveBeenCalled();
    expect(onPost).toHaveBeenCalledWith({ id: '1' });
  });

  it('renvoie false quand aucune route ne correspond', () => {
    const router = new Router();
    router.get('/users/:id', () => undefined);

    expect(router.dispatch('GET', '/unknown')).toBe(false);
  });

  it('respecte l’ordre de déclaration : la première route correspondante gagne', () => {
    const router = new Router();
    const specific = vi.fn();
    const generic = vi.fn();

    router.get('/users/me', specific);
    router.get('/users/:id', generic);

    router.dispatch('GET', '/users/me');

    expect(specific).toHaveBeenCalled();
    expect(generic).not.toHaveBeenCalled();
  });

  it('permet le chaînage des enregistrements', () => {
    const router = new Router();
    const a = vi.fn();
    const b = vi.fn();

    router.get('/a', a).get('/b', b);

    router.dispatch('GET', '/a');
    router.dispatch('GET', '/b');

    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
});
