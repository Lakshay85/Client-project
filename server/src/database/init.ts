import mysql from 'mysql2/promise';
import { databaseName, buildConnectionOptions } from '../config/database.config.js';

export async function initializeDatabase(): Promise<void> {
  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error('Invalid DB_NAME provided: contains illegal characters.');
  }

  const rootConnection = await mysql.createConnection(buildConnectionOptions());

  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await rootConnection.query(`USE \`${databaseName}\``);
  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
      email_verified_at DATETIME NULL,
      last_login_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email)
    ) ENGINE=InnoDB
  `);
  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS login_events (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45) NULL,
      user_agent VARCHAR(500) NULL,
      INDEX idx_login_events_user_id (user_id),
      CONSTRAINT fk_login_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS forms (
      id CHAR(36) PRIMARY KEY,
      share_id VARCHAR(32) NOT NULL UNIQUE,
      user_id CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      access_type ENUM('allow_all', 'allow_only', 'restrict_specific') NOT NULL DEFAULT 'allow_all',
      restricted_emails LONGTEXT NULL,
      single_submission_only BOOLEAN NOT NULL DEFAULT FALSE,
      status ENUM('published', 'draft') NOT NULL DEFAULT 'published',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_forms_user (user_id),
      INDEX idx_forms_share (share_id),
      CONSTRAINT fk_forms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS form_fields (
      id CHAR(36) PRIMARY KEY,
      form_id CHAR(36) NOT NULL,
      label VARCHAR(255) NOT NULL,
      field_type VARCHAR(50) NOT NULL,
      placeholder VARCHAR(255) NULL,
      help_text TEXT NULL,
      is_required BOOLEAN NOT NULL DEFAULT FALSE,
      options JSON NULL,
      config JSON NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_fields_form (form_id),
      CONSTRAINT fk_fields_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id CHAR(36) PRIMARY KEY,
      form_id CHAR(36) NOT NULL,
      submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      submitter_ip VARCHAR(45) NULL,
      submitter_email VARCHAR(255) NULL,
      INDEX idx_submissions_form (form_id),
      CONSTRAINT fk_submissions_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await rootConnection.query(`
    CREATE TABLE IF NOT EXISTS form_submission_answers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      submission_id CHAR(36) NOT NULL,
      field_id CHAR(36) NOT NULL,
      answer_value LONGTEXT NULL,
      INDEX idx_answers_submission (submission_id),
      INDEX idx_answers_field (field_id),
      CONSTRAINT fk_answers_submission FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // Safe migrations for existing databases
  try {
    await rootConnection.query(`ALTER TABLE forms ADD COLUMN access_type ENUM('allow_all', 'allow_only', 'restrict_specific') NOT NULL DEFAULT 'allow_all'`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE forms ADD COLUMN restricted_emails LONGTEXT NULL`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE forms ADD COLUMN single_submission_only BOOLEAN NOT NULL DEFAULT FALSE`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE form_submissions ADD COLUMN submitter_email VARCHAR(255) NULL`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE users ADD INDEX idx_users_google_id (google_id)`);
  } catch (e) {}
  try {
    await rootConnection.query(`ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL`);
  } catch (e) {}

  await rootConnection.end();
  console.log(`Database '${databaseName}' initialized successfully.`);
}

// Auto-run if executed directly via CLI
if (process.argv[1] && (process.argv[1].endsWith('init.ts') || process.argv[1].endsWith('init.js'))) {
  initializeDatabase().catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
}
