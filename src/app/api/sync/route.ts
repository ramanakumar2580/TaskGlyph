/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";
import { PoolClient } from "pg"; // Import the PoolClient type

// --- [GET FUNCTION] ---
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since") || "0";
  const userId = session.user.id;

  // ✅ --- [THE FIX] ---
  let client: PoolClient | undefined;

  try {
    // 1. Move the connection *inside* the try block.
    client = await pool.connect();

    await client.query("BEGIN"); // Start a transaction
    // ✅ --- END OF FIX ---

    const syncTimestamp = Date.now();

    const [
      userMetadataRes,
      projectsRes,
      tasksRes,
      notesRes,
      foldersRes,
      diaryEntriesRes,
      pomodoroSessionsRes,
      notificationsRes,
    ] = await Promise.all([
      // 1. userMetadata
      client.query(
        `
          SELECT 
            id as "userId", 
            tier,
            trial_started_at as "trialStartedAt",
            (notes_password_hash IS NOT NULL) as "hasNotesPassword"
          FROM users 
          WHERE id = $1
        `,
        [userId]
      ),
      // 2. projects
      client.query(
        `
          SELECT 
            id, name, description,
            accent_color as "accentColor",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM projects 
          WHERE user_id = $1 AND updated_at > $2
        `,
        [userId, since]
      ),
      // 3. tasks
      client.query(
        `
          SELECT 
            id, title, completed, notes, priority, tags, meet_link,
            created_at as "createdAt",
            updated_at as "updatedAt",
            project_id as "projectId",
            parent_id as "parentId",
            due_date as "dueDate",
            recurring_schedule as "recurringSchedule",
            reminder_at as "reminderAt",
            reminder_30_sent,
            reminder_20_sent,
            reminder_10_sent
          FROM tasks 
          WHERE user_id = $1 AND updated_at > $2
        `,
        [userId, since]
      ),
      // 4. notes
      client.query(
        `
          SELECT 
            id, title, content, tags,
            created_at as "createdAt",
            updated_at as "updatedAt",
            folder_id as "folderId",
            is_pinned as "isPinned",
            is_locked as "isLocked",
            is_quick_note as "isQuickNote",
            deleted_at as "deletedAt"
          FROM notes 
          WHERE user_id = $1 AND updated_at > $2
        `,
        [userId, since]
      ),
      // 5. folders
      client.query(
        `
          SELECT 
            id, name,
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM folders 
          WHERE user_id = $1 AND updated_at > $2
        `,
        [userId, since]
      ),
      // 6. [UPDATED] diary_entries with New Fields
      client.query(
        `
          SELECT 
            id, content,
            entry_date as "entryDate",
            created_at as "createdAt",
            mood,
            energy,
            weather,
            location,
            tags,
            is_locked as "isLocked",
            media
          FROM diary_entries 
          WHERE user_id = $1 AND created_at > $2
        `,
        [userId, since]
      ),
      // 7. pomodoro_sessions
      client.query(
        `
          SELECT 
            id, type,
            duration_minutes as "durationMinutes",
            completed_at as "completedAt"
          FROM pomodoro_sessions 
          WHERE user_id = $1 AND completed_at > $2
        `,
        [userId, since]
      ),
      // 8. notifications
      client.query(
        `
          SELECT 
            id, message, link, read,
            user_id as "userId",
            (EXTRACT(EPOCH FROM created_at) * 1000) as "createdAt"
          FROM notifications 
          WHERE user_id = $1 AND (EXTRACT(EPOCH FROM created_at) * 1000) > $2
        `,
        [userId, since]
      ),
    ]);

    await client.query("COMMIT"); // Commit the transaction

    // Return all data in a single JSON object
    return NextResponse.json({
      timestamp: syncTimestamp,
      userMetadata: userMetadataRes.rows,
      projects: projectsRes.rows,
      tasks: tasksRes.rows,
      notes: notesRes.rows,
      folders: foldersRes.rows,
      // [UPDATED] Parse JSON strings for Weather and Media before sending to client
      diaryEntries: diaryEntriesRes.rows.map((row) => ({
        ...row,
        weather: row.weather ? JSON.parse(row.weather) : null,
        media: row.media ? JSON.parse(row.media) : [],
      })),
      pomodoroSessions: pomodoroSessionsRes.rows,
      notifications: notificationsRes.rows,
    });
  } catch (error: any) {
    // ✅ [FIX] Rollback only if client exists
    if (client) {
      await client.query("ROLLBACK"); // Roll back on error
    }
    console.error("Failed to fetch all data for user:", userId, error);
    return NextResponse.json(
      { error: "Failed to fetch data: " + error.message },
      { status: 500 }
    );
  } finally {
    // ✅ [FIX] Always release the client if it was connected
    if (client) {
      client.release();
    }
  }
}

// --- [POST FUNCTION] ---

type SyncOperation = {
  id: string;
  entityType:
    | "task"
    | "project"
    | "note"
    | "diary"
    | "pomodoro"
    | "notification"
    | "folder";
  operation: "create" | "update" | "delete";
  payload: any;
  timestamp: number;
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let operations: SyncOperation[];
  try {
    const body = await request.json();
    operations = body.operations;
    if (!Array.isArray(operations)) {
      throw new Error("Invalid operations format");
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body: " + (error as Error).message },
      { status: 400 }
    );
  }

  const results: { id: string; success: boolean; error?: string }[] = [];

  // ✅ --- [THE FIX] ---
  let client: PoolClient | undefined;

  try {
    // 1. Move connection inside the try block
    client = await pool.connect();
    // ✅ --- END OF FIX ---

    const { rows: userRows } = await client.query(
      "SELECT tier FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      // client.release() will be handled in 'finally'
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = userRows[0].tier;
    await client.query("BEGIN");

    for (const op of operations) {
      try {
        let query = "";
        let values: any[] = [];

        switch (op.entityType) {
          // --- 'project' case
          case "project":
            if (op.operation === "create") {
              query = `
                INSERT INTO projects (
                  id, user_id, name, description, accent_color, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.name,
                op.payload.description || null,
                op.payload.accentColor || null,
                op.payload.createdAt,
                op.payload.updatedAt,
              ];
            } else if (op.operation === "update") {
              query = `
                UPDATE projects 
                SET name = $1, description = $2, accent_color = $3, updated_at = $4
                WHERE id = $5 AND user_id = $6
              `;
              values = [
                op.payload.name,
                op.payload.description || null,
                op.payload.accentColor || null,
                op.payload.updatedAt,
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              query = `DELETE FROM projects WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // 'task' case
          case "task":
            if (op.operation === "create") {
              if (tier === "free") {
                const { rows } = await client.query(
                  "SELECT COUNT(*) FROM tasks WHERE user_id = $1",
                  [userId]
                );
                const count = parseInt(rows[0].count);
                if (count >= 21) {
                  results.push({
                    id: op.id,
                    success: false,
                    error: "Free tier task limit reached (21 tasks)",
                  });
                  continue;
                }
              }

              query = `
                INSERT INTO tasks (
                  id, user_id, title, completed, created_at, updated_at,
                  project_id, parent_id, notes, due_date, priority, tags,
                  recurring_schedule, reminder_at,
                  meet_link, reminder_30_sent, reminder_20_sent, reminder_10_sent
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                  $15, $16, $17, $18
                )
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.title,
                op.payload.completed,
                op.payload.createdAt,
                op.payload.updatedAt,
                op.payload.projectId || null,
                op.payload.parentId || null,
                op.payload.notes || null,
                op.payload.dueDate || null,
                op.payload.priority || "none",
                op.payload.tags || [],
                op.payload.recurringSchedule || "none",
                op.payload.reminderAt || null,
                op.payload.meetLink || null,
                op.payload.reminder_30_sent || false,
                op.payload.reminder_20_sent || false,
                op.payload.reminder_10_sent || false,
              ];
            } else if (op.operation === "update") {
              query = `
                UPDATE tasks 
                SET 
                  title = $1, completed = $2, updated_at = $3,
                  project_id = $4, parent_id = $5, notes = $6,
                  due_date = $7, priority = $8, tags = $9,
                  recurring_schedule = $10, reminder_at = $11,
                  meet_link = $12, reminder_30_sent = $13,
                  reminder_20_sent = $14, reminder_10_sent = $15
                WHERE id = $16 AND user_id = $17
              `;
              values = [
                op.payload.title,
                op.payload.completed,
                op.payload.updatedAt,
                op.payload.projectId || null,
                op.payload.parentId || null,
                op.payload.notes || null,
                op.payload.dueDate || null,
                op.payload.priority || "none",
                op.payload.tags || [],
                op.payload.recurringSchedule || "none",
                op.payload.reminderAt || null,
                op.payload.meetLink || null,
                op.payload.reminder_30_sent || false,
                op.payload.reminder_20_sent || false,
                op.payload.reminder_10_sent || false,
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // 'note' case
          case "note":
            if (op.operation === "create") {
              if (tier === "free") {
                const { rows } = await client.query(
                  "SELECT COUNT(*) FROM notes WHERE user_id = $1",
                  [userId]
                );
                const count = parseInt(rows[0].count);
                if (count >= 14) {
                  results.push({
                    id: op.id,
                    success: false,
                    error: "Free tier note limit reached",
                  });
                  continue;
                }
              }
              query = `
                INSERT INTO notes (
                  id, user_id, title, content, created_at, updated_at,
                  folder_id, is_pinned, is_locked, is_quick_note, deleted_at,
                  tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.title,
                op.payload.content,
                op.payload.createdAt,
                op.payload.updatedAt,
                op.payload.folderId || null,
                op.payload.isPinned || false,
                op.payload.isLocked || false,
                op.payload.isQuickNote || false,
                op.payload.deletedAt || null,
                op.payload.tags || [],
              ];
            } else if (op.operation === "update") {
              query = `
                UPDATE notes 
                SET 
                  title = $1, content = $2, updated_at = $3,
                  folder_id = $4, is_pinned = $5, is_locked = $6,
                  is_quick_note = $7, deleted_at = $8,
                  tags = $9
                WHERE id = $10 AND user_id = $11
              `;
              values = [
                op.payload.title,
                op.payload.content,
                op.payload.updatedAt,
                op.payload.folderId || null,
                op.payload.isPinned || false,
                op.payload.isLocked || false,
                op.payload.isQuickNote || false,
                op.payload.deletedAt || null,
                op.payload.tags || [],
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              query = `DELETE FROM notes WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // 'folder' case
          case "folder":
            if (op.operation === "create") {
              query = `
                INSERT INTO folders (id, user_id, name, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.name,
                op.payload.createdAt,
                op.payload.updatedAt,
              ];
            } else if (op.operation === "update") {
              query = `
                UPDATE folders
                SET name = $1, updated_at = $2
                WHERE id = $3 AND user_id = $4
              `;
              values = [
                op.payload.name,
                op.payload.updatedAt,
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              query = `DELETE FROM folders WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // ✅ [UPDATED] 'diary' case
          case "diary":
            if (tier === "free") {
              results.push({
                id: op.id,
                success: false,
                error: "Diary not available on Free tier",
              });
              continue;
            }
            if (op.operation === "create" || op.operation === "update") {
              query = `
                INSERT INTO diary_entries (
                  id, user_id, entry_date, content, created_at,
                  mood, energy, weather, location, tags, is_locked, media
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO UPDATE SET 
                  content = $4, 
                  created_at = $5,
                  mood = $6,
                  energy = $7,
                  weather = $8,
                  location = $9,
                  tags = $10,
                  is_locked = $11,
                  media = $12
              `;

              // Ensure JSON fields are stringified for TEXT columns
              const weatherStr = op.payload.weather
                ? JSON.stringify(op.payload.weather)
                : null;
              const mediaStr = op.payload.media
                ? JSON.stringify(op.payload.media)
                : null;

              values = [
                op.payload.id,
                userId,
                op.payload.entryDate,
                op.payload.content,
                op.payload.createdAt,
                // New Fields
                op.payload.mood || null,
                op.payload.energy || null,
                weatherStr,
                op.payload.location || null,
                op.payload.tags || [],
                op.payload.isLocked || false,
                mediaStr,
              ];
            } else if (op.operation === "delete") {
              query = `DELETE FROM diary_entries WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // 'pomodoro' case
          case "pomodoro":
            if (op.operation === "create") {
              if (tier === "free") {
                const { rows } = await client.query(
                  `SELECT COUNT(*) FROM pomodoro_sessions WHERE user_id = $1 AND DATE_TRUNC('month', TO_TIMESTAMP(completed_at / 1000)) = DATE_TRUNC('month', NOW())`,
                  [userId]
                );
                const count = parseInt(rows[0].count);
                if (count >= 21) {
                  results.push({
                    id: op.id,
                    success: false,
                    error: "Free tier Pomodoro limit reached",
                  });
                  continue;
                }
              }
              query = `INSERT INTO pomodoro_sessions (id, user_id, duration_minutes, completed_at, type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`;
              values = [
                op.payload.id,
                userId,
                op.payload.durationMinutes,
                op.payload.completedAt,
                op.payload.type || "work",
              ];
            } else if (op.operation === "delete") {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // 'notification' case
          case "notification":
            if (op.operation === "create") {
              query = `
                INSERT INTO notifications (id, user_id, message, link, read, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.message,
                op.payload.link || null,
                op.payload.read || false,
              ];
            } else if (op.operation === "update") {
              query = `
                UPDATE notifications 
                SET read = $1
                WHERE id = $2 AND user_id = $3
              `;
              values = [op.payload.read, op.payload.id, userId];
            } else if (op.operation === "delete") {
              query = `DELETE FROM notifications WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          default:
            throw new Error(`Unsupported entity type: ${op.entityType}`);
        }

        if (query) {
          await client.query(query, values);
        }

        results.push({ id: op.id, success: true });
      } catch (error: any) {
        console.error("Sync error for operation", op.id, error);
        results.push({ id: op.id, success: false, error: error.message });
        throw new Error(`Operation ${op.id} failed: ${error.message}`);
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({ results });
  } catch (error: any) {
    // ✅ [FIX] Rollback only if client exists
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error(
      "A critical sync error occurred, transaction rolled back:",
      error
    );

    if (results.some((r) => !r.success)) {
      return NextResponse.json({ results }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Sync failed. Check server logs." },
      { status: 500 }
    );
  } finally {
    // ✅ [FIX] Always release the client if it was connected
    if (client) {
      client.release();
    }
  }
}
