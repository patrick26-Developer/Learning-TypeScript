/**
 * EXERCICE 01 — Inférence et narrowing                          🟡 Consolidation
 *
 * OBJECTIF
 *   Écrire une fonction `describeValue` qui reçoit une valeur de type
 *   `unknown` (par exemple : le résultat de `JSON.parse`) et renvoie une
 *   description textuelle SANS jamais utiliser `any` ni une assertion `as`.
 *
 * CONTRAINTES
 *   - Le paramètre reste `unknown` : vous devez le NARROWER (réduire son
 *     type) avant de l'utiliser, jamais l'affirmer de force.
 *   - Aucun `any`, aucun `as`.
 *
 * CRITÈRE DE RÉUSSITE
 *   Tous les tests de tests/01-inference-et-narrowing.test.ts passent.
 *
 * INDICE (à ne lire qu'après 15 minutes de blocage)
 *   `typeof` fonctionne pour les primitifs. Pour distinguer un tableau
 *   d'un objet, `typeof` ne suffit pas : les deux valent 'object'.
 *   `Array.isArray` est le narrowing correct pour un tableau.
 */

export function describeValue(value: unknown): string {
  // TODO: remplacez cette ligne.
  // Elle doit gérer, dans cet ordre : null, tableau, objet, string, number,
  // boolean, et un cas par défaut pour tout le reste (undefined, etc.).
  throw new Error('Not implemented');
}
