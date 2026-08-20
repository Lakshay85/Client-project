import mysql from 'mysql2/promise';
import { buildPoolOptions } from '../config/database.config.js';

// Re-export databaseName for backwards compatibility
export { databaseName } from '../config/database.config.js';

export const pool = mysql.createPool(buildPoolOptions());

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    return false;
  }
}
