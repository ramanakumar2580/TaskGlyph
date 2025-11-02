/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";

// [UPDATED] Added 'notification' to the entity type
type SyncOperation = {
  id: string;
  entityType:
    | "task"
    | "project"
    | "note"
    | "diary"
    | "pomodoro"
    | "notification";
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

  try {
    const { rows: userRows } = await pool.query(
      "SELECT tier FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tier = userRows[0].tier;

    for (const op of operations) {
      try {
        let query = "";
        let values: any[] = [];

        switch (op.entityType) {
          // --- 'project' case (no changes) ---
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

          // [UPDATED] 'task' case with reminder fields
          case "task":
            if (op.operation === "create") {
              // Free tier limit check (still works)
              if (tier === "free") {
                const { rows } = await pool.query(
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

              // [UPDATED] query with all new fields
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
              // [UPDATED] values array to match all fields
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
                // [NEW] Add reminder fields
                op.payload.meetLink || null,
                op.payload.reminder_30_sent || false,
                op.payload.reminder_20_sent || false,
                op.payload.reminder_10_sent || false,
              ];
            } else if (op.operation === "update") {
              // [UPDATED] query with all new fields
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
              // [UPDATED] values array to match all fields
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
                // [NEW] Add reminder fields
                op.payload.meetLink || null,
                op.payload.reminder_30_sent || false,
                op.payload.reminder_20_sent || false,
                op.payload.reminder_10_sent || false,
                // WHERE clause
                op.payload.id, // for WHERE id = $16
                userId, // for WHERE user_id = $17
              ];
            } else if (op.operation === "delete") {
              // Delete logic is unchanged
              query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          // --- NO CHANGES to note or diary ---
          case "note":
            // (Your existing 'note' logic is perfect)
            if (op.operation === "create") {
              if (tier === "free") {
                const { rows } = await pool.query(
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
              query = `INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`;
              values = [
                op.payload.id,
                userId,
                op.payload.title,
                op.payload.content,
                op.payload.createdAt,
                op.payload.updatedAt,
              ];
            } else if (op.operation === "update") {
              query = `UPDATE notes SET title = $1, content = $2, updated_at = $3 WHERE id = $4 AND user_id = $5`;
              values = [
                op.payload.title,
                op.payload.content,
                op.payload.updatedAt,
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

          case "diary":
            // (Your existing 'diary' logic is perfect)
            if (tier === "free") {
              results.push({
                id: op.id,
                success: false,
                error: "Diary not available on Free tier",
              });
              continue;
            }
            if (op.operation === "create" || op.operation === "update") {
              query = `INSERT INTO diary_entries (id, user_id, entry_date, content, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET content = $4, created_at = $5`;
              values = [
                op.payload.id,
                userId,
                op.payload.entryDate,
                op.payload.content,
                op.payload.createdAt,
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

          // --- NO CHANGES to pomodoro ---
          case "pomodoro":
            // (Your existing 'pomodoro' logic is perfect)
            if (op.operation === "create") {
              if (tier === "free") {
                const { rows } = await pool.query(
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

          // [NEW] Add case for 'notification'
          case "notification":
            if (op.operation === "create") {
              // Notifications are usually created by the server (cron job),
              // but we can support client-side creation if needed.
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
              // Typically only updating the 'read' status
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
          await pool.query(query, values);
        }

        results.push({ id: op.id, success: true });
      } catch (error: any) {
        console.error("Sync error for operation", op.id, error);
        results.push({ id: op.id, success: false, error: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error(
      "A critical sync error occurred (likely a DB connection issue):",
      error
    );
    return NextResponse.json(
      { error: "Sync failed. Check server logs." },
      { status: 500 }
    );
  }
}
