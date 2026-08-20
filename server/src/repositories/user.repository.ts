import { pool } from '../database/connection.js';
import { UserRow } from '../types/index.js';

/**
 * Repository for user data access operations.
 * Encapsulates all SQL queries related to the users table.
 */
export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0];
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  }

  async findByGoogleId(googleId: string): Promise<UserRow | undefined> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE google_id = ? LIMIT 1',
      [googleId]
    );
    return rows[0];
  }

  async create(params: {
    id: string;
    name: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
  }): Promise<UserRow> {
    if (params.googleId) {
      await pool.execute(
        'INSERT INTO users (id, name, email, google_id, email_verified_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [params.id, params.name, params.email, params.googleId]
      );
    } else {
      await pool.execute(
        'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
        [params.id, params.name, params.email, params.passwordHash ?? null]
      );
    }

    const user = await this.findById(params.id);
    if (!user) throw new Error('User was not created.');
    return user;
  }

  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET google_id = ? WHERE id = ?',
      [googleId, userId]
    );
  }

  async updateLastLogin(userId: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  async recordLoginEvent(
    userId: string,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    await pool.execute(
      'INSERT INTO login_events (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [userId, ipAddress, userAgent?.slice(0, 500) ?? null]
    );
  }
}

export const userRepository = new UserRepository();
