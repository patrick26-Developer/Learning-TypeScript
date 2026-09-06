/**
 * CORRIGÉ 01 — Inférence et narrowing
 *
 * IDÉE CENTRALE
 *   `unknown` n'autorise AUCUNE opération tant que TypeScript n'a pas pu
 *   prouver, ligne par ligne, ce que la valeur EST réellement. Chaque `if`
 *   ci-dessous est une preuve : après lui, TypeScript "sait" un peu plus.
 *
 *   C'est l'inverse exact de `any`, qui n'exige jamais aucune preuve — et
 *   qui, pour cette raison, ne protège de rien.
 */
export function describeValue(value: unknown): string {
  // 1. `null` D'ABORD, et c'est un piège classique de JavaScript.
  //    `typeof null === 'object'` : si on testait `typeof value === 'object'`
  //    avant ce cas, `null` serait mal classé.
  if (value === null) {
    return 'null';
  }

  // 2. Les tableaux ensuite, pour la même raison : `typeof [] === 'object'`.
  //    `Array.isArray` est la SEULE façon fiable de détecter un tableau ;
  //    `instanceof Array` échoue entre plusieurs "royaumes" JavaScript
  //    (par exemple entre un onglet et une iframe).
  if (Array.isArray(value)) {
    // Ici, TypeScript a réduit `value` à `unknown[]`. On peut lire `.length`
    // en toute sécurité : c'est une propriété de TOUS les tableaux.
    return `tableau de ${String(value.length)} élément(s)`;
  }

  // 3. Les primitifs : `typeof` est un "type guard" reconnu nativement par
  //    TypeScript. Après ce bloc, `value` est réduit à `string`.
  if (typeof value === 'string') {
    return `chaîne : "${value}"`;
  }

  if (typeof value === 'number') {
    // `Number.isNaN` plutôt que `isNaN` global : `isNaN('abc')` convertit
    // sa chaîne en nombre avant de tester, ce qui donne des faux positifs.
    return Number.isNaN(value) ? 'NaN' : `nombre : ${String(value)}`;
  }

  if (typeof value === 'boolean') {
    return `booléen : ${String(value)}`;
  }

  // 4. Un objet "ordinaire" restant (ni null, ni tableau, ni primitif).
  if (typeof value === 'object') {
    // `Object.keys` accepte `object` sans plainte : à ce stade, value est
    // typé `object`, ce qui suffit pour cet appel.
    return `objet avec ${String(Object.keys(value).length)} clé(s)`;
  }

  // 5. Cas restants : undefined, function, symbol, bigint.
  //    On ne les détaille pas : le but de l'exercice est le narrowing,
  //    pas l'exhaustivité totale. Un `default` explicite reste nécessaire
  //    pour que la fonction ait TOUJOURS un retour (noImplicitReturns).
  return `valeur de type ${typeof value}`;
}

/**
 * ERREURS CLASSIQUES
 * -------------------
 *
 * 1. Tester `typeof value === 'object'` AVANT `value === null`.
 *
 *      if (typeof value === 'object') { … }  // ❌ piège : null tombe ici
 *      if (value === null) { … }
 *
 *    `typeof null` vaut `'object'` depuis les tout débuts de JavaScript.
 *    C'est un bug historique du langage que personne n'a jamais pu corriger
 *    sans casser du code existant. TypeScript en hérite tel quel — c'est
 *    la Décision 1 du module 00 (sur-ensemble de JavaScript).
 *
 * 2. Utiliser une assertion pour "aller plus vite" :
 *
 *      return `tableau de ${(value as unknown[]).length} élément(s)`;
 *
 *    Cela compile, mais ce n'est PLUS du narrowing : c'est une promesse non
 *    vérifiée. Si `value` n'est pas réellement un tableau, `.length` renvoie
 *    `undefined` sans qu'aucune erreur ne prévienne personne.
 *
 * 3. Oublier le cas par défaut, en pensant avoir couvert tous les cas :
 *
 *      if (typeof value === 'string') { return …; }
 *      if (typeof value === 'number') { return …; }
 *      // pas de retour si value est `undefined` ou une fonction
 *
 *    Avec `noImplicitReturns` activé dans ce dépôt, ceci est une ERREUR DE
 *    COMPILATION, pas seulement un bug potentiel : TypeScript refuse une
 *    fonction dont un chemin d'exécution ne retourne rien alors qu'elle
 *    promet de renvoyer un `string`.
 */
