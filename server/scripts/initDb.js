/**
 * Polyxos Database Initializer
 * Run: npm run db:init
 *
 * This script:
 *  1. Creates the 'polyxos_db' database if it doesn't exist
 *  2. Runs schema.sql to create all tables, triggers, and indexes
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

async function createDatabase() {
  // Connect to the default 'postgres' system DB to create our app DB
  const adminConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };

  const adminClient = new Client(adminConfig);

  try {
    await adminClient.connect();

    const dbName = process.env.DB_NAME || 'polyxos_db';
    const exists = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (exists.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created.`);
    } else {
      console.log(`ℹ️  Database '${dbName}' already exists.`);
    }
  } finally {
    await adminClient.end();
  }
}

async function runSchema() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const clientConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME     || 'polyxos_db',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    await client.query(sql);
    console.log('✅ Schema applied — tables, triggers, and indexes created.');
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('');
  console.log('🗄️  Polyxos — Database Initialization');
  console.log('─────────────────────────────────────');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log(`   DB:   ${process.env.DB_NAME || 'polyxos_db'}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log('');

  try {
    await createDatabase();
    await runSchema();
    console.log('');
    console.log('🎉 Database ready! You can now run: npm run dev:server');
    console.log('');
  } catch (err) {
    console.error('');
    console.error('❌ Initialization failed:', err.message);
    console.error('');
    console.error('   Common fixes:');
    console.error('   • Make sure PostgreSQL is running');
    console.error('   • Update DB_PASSWORD in your .env file');
    console.error('   • Check DB_USER has CREATE DATABASE privileges');
    console.error('');
    process.exit(1);
  }
}

main();
