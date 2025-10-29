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
  // ✅ FIX: Add this SSL configuration. Neon requires it.
  ssl: {
    rejectUnauthorized: false,
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
      tier TEXT DEFAULT 'free',
      trial_started_at BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Tasks table
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

  // Pomodoro sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      duration_minutes INTEGER NOT NULL,
      completed_at BIGINT NOT NULL,
      type TEXT DEFAULT 'work' -- ✅ 1. Add the new 'type' column
    );
  `);

  // Device tracking (for tier enforcement)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      device_fingerprint TEXT NOT NULL,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✅ All tables created successfully.");
  await pool.end();
}

createTables().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await pool.end();
  process.exit(1);
});
