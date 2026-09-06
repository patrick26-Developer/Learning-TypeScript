/**
 * Extrait le nom d'un paramètre d'UN segment d'URL : ":id" → "id".
 * Un segment sans ":" ne produit aucun nom (`never`).
 */
type ExtractParam<Segment extends string> = Segment extends `:${infer Name}` ? Name : never;

/**
 * Parcourt récursivement chaque segment du chemin, séparé par "/", et
 * ACCUMULE les noms de paramètres trouvés dans une UNION. C'est la même
 * récursion sur littéral de gabarit que `PathValue` du module 10, appliquée
 * ici à la découpe d'une route plutôt qu'à la lecture d'un objet.
 */
type ExtractParamNames<Path extends string> = Path extends `${infer Segment}/${infer Rest}`
  ? ExtractParam<Segment> | ExtractParamNames<Rest>
  : ExtractParam<Path>;

/**
 * Le type public de ce paquet : à partir d'UNE chaîne de route littérale,
 * déduit l'objet de paramètres exact que le gestionnaire recevra.
 *
 *   RouteParams<'/users/:id/posts/:postId'>
 *   → { id: string; postId: string }
 *
 *   RouteParams<'/health'>
 *   → {}  (aucun paramètre)
 */
export type RouteParams<Path extends string> = Record<ExtractParamNames<Path>, string>;
