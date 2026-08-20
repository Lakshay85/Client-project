import { Request } from 'express';
import { RowDataPacket } from 'mysql2';

/** Database row type for users table. */
export type UserRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  google_id?: string | null;
  status: 'active' | 'disabled';
  created_at: Date;
  last_login_at?: Date | null;
};

/** Access type for form submission restrictions. */
export type AccessType = 'allow_all' | 'allow_only' | 'restrict_specific';

/** Express request extended with authenticated user. */
export interface AuthRequest extends Request {
  user?: UserRow;
}
