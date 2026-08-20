import { UserRow } from '../types/index.js';

/** Public-facing user representation (no sensitive data). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/** Map a database UserRow to a PublicUser DTO. */
export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.created_at).toISOString(),
  };
}
