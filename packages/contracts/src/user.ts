import { z } from 'zod';

/**
 * Schéma de l'entité `User` telle qu'exposée par l'API.
 *
 * `z.infer<typeof UserSchema>` DÉRIVE le type TypeScript directement du
 * schéma de validation. Il n'existe qu'une seule source de vérité : on ne
 * peut pas laisser le type et la validation diverger, puisque le second
 * PRODUIT le premier.
 */
export const UserSchema = z.object({
  // Zod 4 introduit des validateurs de PREMIER NIVEAU (`z.uuid()`,
  // `z.email()`) qui remplacent les anciennes méthodes chaînées
  // (`z.string().uuid()`, `z.string().email()`), désormais dépréciées.
  id: z.uuid(),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  createdAt: z.iso.datetime(),
});

export type User = z.infer<typeof UserSchema>;
