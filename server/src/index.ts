import 'dotenv/config';
import { createApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { testDatabaseConnection } from './database/connection.js';
import { initializeDatabase } from './database/init.js';

/**
 * Application entry point.
 * Initializes the database and starts the HTTP server.
 */
async function startServer() {
  try {
    console.log('Initializing MySQL database schema...');
    await initializeDatabase();

    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Warning: MySQL database connection failed.');
      process.exit(1);
    }
    console.log('✅ MySQL Database connected successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize MySQL database:', error);
    process.exit(1);
  }

  const app = createApp();
  const { port } = appConfig;

  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
}

startServer();
