/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";

type SyncOperation = {
  id: string;
  entityType: "task" | "note" | "diary" | "pomodoro";
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
    // Get user tier
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
          case "task":
            if (op.operation === "create") {
              // ... (task create logic, no changes)
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
                    error: "Free tier task limit reached",
                  });
                  continue;
                }
              }

              query = `
                INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.title,
                op.payload.completed,
                op.payload.createdAt,
                op.payload.updatedAt,
              ];
            } else if (op.operation === "update") {
              // ... (task update logic, no changes)
              query = `
                UPDATE tasks 
                SET title = $1, completed = $2, updated_at = $3
                WHERE id = $4 AND user_id = $5
              `;
              values = [
                op.payload.title,
                op.payload.completed,
                op.payload.updatedAt,
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              // ... (task delete logic, no changes)
              query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          case "note":
            if (op.operation === "create") {
              // ... (note create logic, no changes)
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

              query = `
                INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
              `;
              values = [
                op.payload.id,
                userId,
                op.payload.title,
                op.payload.content,
                op.payload.createdAt,
                op.payload.updatedAt,
              ];
            } else if (op.operation === "update") {
              // ... (note update logic, no changes)
              query = `
                UPDATE notes 
                SET title = $1, content = $2, updated_at = $3
                WHERE id = $4 AND user_id = $5
              `;
              values = [
                op.payload.title,
                op.payload.content,
                op.payload.updatedAt,
                op.payload.id,
                userId,
              ];
            } else if (op.operation === "delete") {
              // ... (note delete logic, no changes)
              query = `DELETE FROM notes WHERE id = $1 AND user_id = $2`;
              values = [op.payload.id, userId];
            } else {
              throw new Error(
                `Unsupported operation "${op.operation}" for entity "${op.entityType}"`
              );
            }
            break;

          case "diary":
            // ... (diary logic, no changes)
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
                INSERT INTO diary_entries (id, user_id, entry_date, content, created_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE 
                SET content = $4, created_at = $5
              `;
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

          case "pomodoro":
            if (op.operation === "create") {
              // ... (pomodoro tier limit, no changes)
              if (tier === "free") {
                const { rows } = await pool.query(
                  `SELECT COUNT(*) 
                   FROM pomodoro_sessions 
                   WHERE user_id = $1 
                   AND DATE_TRUNC('month', TO_TIMESTAMP(completed_at / 1000)) = DATE_TRUNC('month', NOW())`,
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

              // ✅ 1. Add 'type' to the query
              query = `
                INSERT INTO pomodoro_sessions (id, user_id, duration_minutes, completed_at, type)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING
              `;
              // ✅ 2. Add 'op.payload.type' to the values
              values = [
                op.payload.id,
                userId,
                op.payload.durationMinutes,
                op.payload.completedAt,
                op.payload.type || "work", // Default to 'work' if type is missing
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
