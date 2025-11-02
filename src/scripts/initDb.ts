import { config } from "dotenv";
import { Pool } from "pg";

// Force load .env.local
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

console.log("✅ Using DATABASE_URL:", process.env.DATABASE_URL.split("@")[1]); // Hide password

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requires SSL
  },
});

async function createTables() {
  console.log("Creating tables...");

  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT, -- For email/pass login
      tier TEXT DEFAULT 'free',
      trial_started_at BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Checked/Created users table.");

  // Projects table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      accent_color TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `);
  console.log("Checked/Created projects table.");

  // Tasks table (basic structure)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `);
  console.log("Checked/Created tasks table.");

  // Notes table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `);
  console.log("Checked/Created notes table.");

  // Diary entries table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL, -- YYYY-MM-DD
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
  `);
  console.log("Checked/Created diary_entries table.");

  // Pomodoro sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      duration_minutes INTEGER NOT NULL,
      completed_at BIGINT NOT NULL,
      type TEXT DEFAULT 'work'
    );
  `);
  console.log("Checked/Created pomodoro_sessions table.");

  // Device tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      device_fingerprint TEXT NOT NULL,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Checked/Created user_devices table.");

  // --- [NEW] Notifications table for the in-app bell icon ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      link TEXT, -- e.g., to the task/meeting ID
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Checked/Created notifications table.");

  // --- Column Updates ---
  console.log("Running ALTER TABLE commands to ensure schema is up to date...");
  try {
    // Add 'password' to users
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;`
    );

    // Add 'type' to pomodoro_sessions
    await pool.query(
      `ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'work';`
    );

    // [UPDATED] Add all new columns to TASKS table
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES tasks(id) ON DELETE CASCADE;`
    );
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;`);
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date BIGINT;`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'none';`
    );
    await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];`);
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_schedule TEXT DEFAULT 'none';`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_at BIGINT;`
    );

    // --- [NEW] Add columns for meetings and reminders ---
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS meet_link TEXT;`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_30_sent BOOLEAN DEFAULT false;`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_20_sent BOOLEAN DEFAULT false;`
    );
    await pool.query(
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_10_sent BOOLEAN DEFAULT false;`
    );

    console.log("✅ Schema columns updated successfully.");
  } catch (err) {
    console.warn(
      "Could not add columns (might already exist or other error):",
      (err as Error).message
    );
  }
  // --- End Column Updates ---

  console.log("✅ Database schema check/update complete.");
  await pool.end();
}

createTables().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await pool.end();
  process.exit(1);
});
