import 'dotenv/config';
import mysql, { PoolOptions } from 'mysql2/promise';

const isCloud = (process.env.DB_MODE ?? 'local').toLowerCase() === 'cloud';

// Resolve database config based on DB_MODE
const dbHost = isCloud
  ? (process.env.CLOUD_DB_HOST ?? 'localhost')
  : (process.env.DB_HOST ?? '127.0.0.1');

const dbPort = isCloud
  ? Number(process.env.CLOUD_DB_PORT ?? 20341)
  : Number(process.env.DB_PORT ?? 3306);

export const databaseName = isCloud
  ? (process.env.CLOUD_DB_NAME ?? 'defaultdb')
  : (process.env.DB_NAME ?? 'client_project');

const dbUser = isCloud
  ? (process.env.CLOUD_DB_USER ?? 'avnadmin')
  : (process.env.DB_USER ?? 'root');

const dbPassword = isCloud
  ? process.env.CLOUD_DB_PASSWORD
  : process.env.DB_PASSWORD;

// Build pool options
const poolOptions: PoolOptions = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+05:30'
};

// Aiven (and most cloud providers) require SSL
if (isCloud && process.env.CLOUD_DB_SSL !== 'false') {
  poolOptions.ssl = {
    rejectUnauthorized: false
  };
}

console.log(`[DB] Mode: ${isCloud ? 'CLOUD' : 'LOCAL'} → ${dbHost}:${dbPort}/${databaseName}`);

export const pool = mysql.createPool(poolOptions);

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
