/**
 * Le même patron "erreurs comme valeurs" que `taskline` (module 07 —
 * unions discriminées), réutilisé ici pour chaque colonne ET pour chaque
 * ligne. Aucune exception n'est levée pendant l'analyse d'un fichier CSV :
 * une ligne mal formée ne doit jamais interrompre l'analyse des suivantes.
 */
export type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly string[] };

export function ok<T>(value: T): ParseResult<T> {
  return { ok: true, value };
}

export function err<T>(...errors: string[]): ParseResult<T> {
  return { ok: false, errors };
}
