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
      password TEXT, -- ✅ ADDED: Column for hashed password (nullable)
      tier TEXT DEFAULT 'free',
      trial_started_at BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Checked/Created users table."); // Added log

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
  console.log("Checked/Created tasks table."); // Added log

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
  console.log("Checked/Created notes table."); // Added log

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
  console.log("Checked/Created diary_entries table."); // Added log

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
  console.log("Checked/Created pomodoro_sessions table."); // Added log

  // Device tracking (for tier enforcement)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      device_fingerprint TEXT NOT NULL,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log("Checked/Created user_devices table."); // Added log
  try {
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;`
    );
    console.log("Ensured 'password' column exists on users table.");
  } catch (err) {
    // Ignore errors like "column already exists"
    console.warn(
      "Could not add 'password' column (might already exist):",
      (err as Error).message
    );
  }
  // Similarly for pomodoro 'type' column if added after initial creation
  try {
    await pool.query(
      `ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'work';`
    );
    console.log("Ensured 'type' column exists on pomodoro_sessions table.");
  } catch (err) {
    console.warn(
      "Could not add 'type' column (might already exist):",
      (err as Error).message
    );
  }

  console.log("✅ Database schema check/update complete.");
  await pool.end();
}

createTables().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await pool.end();
  process.exit(1);
});
