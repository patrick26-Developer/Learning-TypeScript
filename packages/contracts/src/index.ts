/**
 * @atlas/contracts — point d'entrée public.
 *
 * CE QUE CE PAQUET DÉMONTRE
 * -------------------------
 * Un seul schéma Zod produit à la fois :
 *   1. un TYPE STATIQUE (`z.infer`), utilisé par TypeScript à la compilation ;
 *   2. une VALIDATION RUNTIME (`schema.parse`), utilisée à l'exécution.
 *
 * C'est la réponse concrète à la Décision 2 du module 00 : les types
 * disparaissent à la compilation, donc RIEN ne garantit qu'une réponse HTTP
 * respecte l'interface `User` qu'on lui a assignée. Ce paquet est le contrat
 * que partagent l'API et les trois projets finaux (NEXUS, PULSE, TRAIL) :
 * modifier un champ ici fait échouer la compilation des quatre consommateurs
 * à la fois, au lieu de le découvrir en production sur un seul.
 */

export { UserSchema, type User } from './user.js';
