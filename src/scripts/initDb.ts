import { config } from "dotenv";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import process from "process";

// Force load .env.local
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  // Don't exit here if imported by the app, just throw error
  if (process.env.NODE_ENV !== "production") {
    throw new Error("DATABASE_URL missing");
  }
}

// ✅ 1. Create the Pool GLOBALLY so the App can use it
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon/Supabase require this
  },
  max: 10, // Max clients
  idleTimeoutMillis: 30000,
});

// ✅ 2. Export the query helper and pool for API Routes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;

// --- MIGRATION LOGIC (Only runs when you execute this file directly) ---
async function createTables() {
  console.log("Connecting to database to create tables...");
  const client = await pool.connect();
  console.log("✅ Database connected.");

  try {
    console.log("Creating tables...");
    await client.query("BEGIN");

    // 1. Users table (Updated with tier)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT,
        notes_password_hash TEXT,
        tier TEXT DEFAULT 'free', 
        trial_started_at BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Projects table
    await client.query(`
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

    // 3. Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
        parent_id TEXT,
        notes TEXT,
        due_date BIGINT,
        priority TEXT DEFAULT 'none',
        tags TEXT[],
        recurring_schedule TEXT DEFAULT 'none',
        reminder_at BIGINT,
        meet_link TEXT,
        reminder_30_sent BOOLEAN DEFAULT false,
        reminder_20_sent BOOLEAN DEFAULT false,
        reminder_10_sent BOOLEAN DEFAULT false
      );
    `);

    // 4. Folders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `);

    // 5. Notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL,
        folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        is_quick_note BOOLEAN DEFAULT false,
        deleted_at BIGINT,
        tags TEXT[]
      );
    `);

    // 6. Diary entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        mood TEXT,
        energy INTEGER,
        weather TEXT,
        location TEXT,
        tags TEXT[],
        is_locked BOOLEAN DEFAULT false,
        media TEXT
      );
    `);

    // 7. Pomodoro sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        duration_minutes INTEGER NOT NULL,
        completed_at BIGINT NOT NULL,
        type TEXT DEFAULT 'work'
      );
    `);

    // 8. User devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_devices (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        device_fingerprint TEXT NOT NULL,
        registered_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        link TEXT,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. PAYMENTS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY, -- razorpay_payment_id
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        order_id TEXT NOT NULL,
        amount INTEGER NOT NULL, -- in paise
        currency TEXT DEFAULT 'INR',
        plan_name TEXT NOT NULL, -- 'Basic', 'Pro', 'Ultra'
        status TEXT DEFAULT 'success',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // --- Column Updates (ALTER TABLE) ---
    // This allows you to run the script on an existing DB to add new columns safely
    try {
      // User Updates
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;`
      );
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS notes_password_hash TEXT;`
      );

      // ✅ [NEW] Added columns for Password Reset (Forgot Password)
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS notes_reset_code TEXT;`
      );
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS notes_reset_expiry BIGINT;`
      );

      // Ensure tier column exists for existing users
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';`
      );

      // Pomodoro Updates
      await client.query(
        `ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'work';`
      );

      // Tasks updates
      const taskCols = [
        "project_id TEXT REFERENCES projects(id) ON DELETE SET NULL",
        "parent_id TEXT REFERENCES tasks(id) ON DELETE CASCADE",
        "notes TEXT",
        "due_date BIGINT",
        "priority TEXT DEFAULT 'none'",
        "tags TEXT[]",
        "recurring_schedule TEXT DEFAULT 'none'",
        "reminder_at BIGINT",
        "meet_link TEXT",
        "reminder_30_sent BOOLEAN DEFAULT false",
        "reminder_20_sent BOOLEAN DEFAULT false",
        "reminder_10_sent BOOLEAN DEFAULT false",
      ];
      for (const col of taskCols) {
        const colName = col.split(" ")[0];
        await client.query(
          `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ${colName} ${col.substring(
            colName.length
          )};`
        );
      }

      // Notes updates
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL;`
      );
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;`
      );
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;`
      );
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_quick_note BOOLEAN DEFAULT false;`
      );
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at BIGINT;`
      );
      await client.query(
        `ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[];`
      );
      await client.query(`ALTER TABLE notes ALTER COLUMN content TYPE TEXT;`);

      // Diary updates
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS mood TEXT;`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS energy INTEGER;`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS weather TEXT;`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS location TEXT;`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS tags TEXT[];`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;`
      );
      await client.query(
        `ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS media TEXT;`
      );

      await client.query(`DROP TABLE IF EXISTS note_attachments CASCADE;`);
    } catch (e) {
      console.log(
        "Notice during column updates (safe to ignore):",
        (e as Error).message
      );
    }

    await client.query("COMMIT");
    console.log("✅ Database schema check/update complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", (err as Error).message);
    throw err;
  } finally {
    client.release();
  }
}

// Check if this file is being run directly (e.g. `npx ts-node src/db/serverDb.ts`)
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);

if (process.argv[1] === currentFilePath) {
  createTables()
    .then(() => {
      console.log("Script finished.");
      pool.end(); // Close pool ONLY if running as a script
      process.exit(0);
    })
    .catch((err) => {
      console.error("Script crashed:", err);
      pool.end();
      process.exit(1);
    });
}
