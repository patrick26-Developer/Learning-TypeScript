import { matchPath } from './match.js';
import type { RouteParams } from './params.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Représentation interne d'une route, une fois son type de paramètres
 * ERASÉ. C'est nécessaire : un tableau `Route<...>[]` doit contenir des
 * routes de chemins DIFFÉRENTS (donc de `RouteParams` différents), ce que
 * TypeScript ne peut pas représenter directement dans un seul type de
 * tableau homogène.
 */
interface ErasedRoute {
  readonly method: HttpMethod;
  readonly pattern: string;
  readonly handler: (params: Record<string, string>) => void;
}

export class Router {
  #routes: ErasedRoute[] = [];

  /**
   * Enregistre une route. `Path` est déduit du LITTÉRAL passé en argument
   * (pas annoté par l'appelant) : c'est ce qui permet à `handler` de
   * recevoir exactement `RouteParams<Path>`, calculé automatiquement.
   *
   * L'assertion `as (params: Record<string, string>) => void` est la
   * SEULE de tout ce mini-projet, et elle vit ici, une fois, dans
   * l'implémentation du framework — jamais dans le code d'un utilisateur
   * de `Router`. Elle est justifiée : à l'exécution, `RouteParams<Path>`
   * et `Record<string, string>` ont exactement la même représentation
   * (un objet de chaînes) ; seule la PRÉCISION du type diffère, pas la
   * forme réelle des données. C'est le même patron que `QueryBuilder`
   * au module 10.
   */
  on<Path extends string>(
    method: HttpMethod,
    pattern: Path,
    handler: (params: RouteParams<Path>) => void,
  ): this {
    this.#routes.push({
      method,
      pattern,
      handler: handler as (params: Record<string, string>) => void,
    });
    return this;
  }

  get<Path extends string>(pattern: Path, handler: (params: RouteParams<Path>) => void): this {
    return this.on('GET', pattern, handler);
  }

  post<Path extends string>(pattern: Path, handler: (params: RouteParams<Path>) => void): this {
    return this.on('POST', pattern, handler);
  }

  put<Path extends string>(pattern: Path, handler: (params: RouteParams<Path>) => void): this {
    return this.on('PUT', pattern, handler);
  }

  delete<Path extends string>(pattern: Path, handler: (params: RouteParams<Path>) => void): this {
    return this.on('DELETE', pattern, handler);
  }

  /**
   * Trouve la première route déclarée qui correspond à la méthode ET au
   * chemin fournis, et invoque son gestionnaire. Renvoie `false` si aucune
   * route ne correspond — à l'appelant de décider quoi faire (404, etc.).
   */
  dispatch(method: HttpMethod, path: string): boolean {
    for (const route of this.#routes) {
      if (route.method !== method) continue;

      const params = matchPath(route.pattern, path);
      if (params !== null) {
        route.handler(params);
        return true;
      }
    }
    return false;
  }
}
