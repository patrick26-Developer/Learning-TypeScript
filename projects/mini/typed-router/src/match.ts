/**
 * La contrepartie RUNTIME du type `RouteParams<Path>` : personne ne peut
 * vérifier à l'exécution qu'un `":id"` matché produit bien un objet
 * `{ id: string }` — TypeScript l'a déjà garanti à la compilation. Cette
 * fonction n'a donc qu'à faire correspondre des chaînes, sans jamais
 * revalider ce que le système de types a déjà prouvé.
 *
 * Renvoie `null` si le chemin réel ne correspond pas au motif — par
 * exemple un nombre de segments différent, ou un segment littéral qui ne
 * correspond pas exactement.
 */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternSegments = splitPath(pattern);
  const pathSegments = splitPath(path);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i += 1) {
    const patternSegment = patternSegments[i] ?? '';
    const pathSegment = pathSegments[i] ?? '';

    if (patternSegment.startsWith(':')) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
    } else if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

function splitPath(path: string): string[] {
  return path.split('/').filter((segment) => segment.length > 0);
}
