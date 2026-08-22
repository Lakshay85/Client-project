import 'dotenv/config';
import { ConnectionOptions, PoolOptions } from 'mysql2/promise';

export interface DatabaseConfigOptions {
  host: string;
  port: number;
  user: string;
  password: string | undefined;
  database: string;
  ssl: boolean;
}

const isCloud = (process.env.DB_MODE ?? 'local').toLowerCase() === 'cloud';

const host = isCloud
  ? (process.env.CLOUD_DB_HOST ?? 'localhost')
  : (process.env.DB_HOST ?? '127.0.0.1');

const port = isCloud
  ? Number(process.env.CLOUD_DB_PORT ?? 20341)
  : Number(process.env.DB_PORT ?? 3306);

const user = isCloud
  ? (process.env.CLOUD_DB_USER ?? 'avnadmin')
  : (process.env.DB_USER ?? 'root');

const password = isCloud
  ? process.env.CLOUD_DB_PASSWORD
  : process.env.DB_PASSWORD;

export const databaseName = isCloud
  ? (process.env.CLOUD_DB_NAME ?? 'defaultdb')
  : (process.env.DB_NAME ?? 'client_project');

const requireSsl = isCloud && process.env.CLOUD_DB_SSL !== 'false';

export const databaseConfig: DatabaseConfigOptions = {
  host,
  port,
  user,
  password,
  database: databaseName,
  ssl: requireSsl,
};

/** Build a mysql2 PoolOptions object from the shared config. */
export function buildPoolOptions(): PoolOptions {
  const opts: PoolOptions = {
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+05:30',
  };

  if (databaseConfig.ssl) {
    opts.ssl = { rejectUnauthorized: true };
  }

  return opts;
}

/** Build a mysql2 ConnectionOptions (without database) for schema init. */
export function buildConnectionOptions(): ConnectionOptions {
  const opts: ConnectionOptions = {
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
  };

  if (databaseConfig.ssl) {
    opts.ssl = { rejectUnauthorized: true };
  }

  return opts;
}

export const isCloudMode = isCloud;

console.log(`[DB] Mode: ${isCloud ? 'CLOUD' : 'LOCAL'} → ${host}:${port}/${databaseName}`);
