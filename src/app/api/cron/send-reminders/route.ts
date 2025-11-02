// src/app/api/cron/send-reminders/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db/serverDb"; // Your Postgres pool
import { sendMeetingReminder } from "@/lib/email/sendReminder";

// This function will run for each reminder type
async function processReminders(
  minutes: 30 | 20 | 10,
  flagColumn: "reminder_30_sent" | "reminder_20_sent" | "reminder_10_sent"
) {
  const now = Date.now();
  const minutesInMs = minutes * 60 * 1000;
  const bufferInMs = 5 * 60 * 1000; // 5 min buffer to avoid missing

  const targetTime = now + minutesInMs;

  // 1. Find meetings that need a reminder
  const { rows: meetings } = await pool.query(
    `
      SELECT t.*, u.email
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE 
        t.due_date <= $1 AND       -- Less than or equal to 30/20/10 mins from now
        t.due_date > $2 AND        -- Greater than 25/15/5 mins from now
        t.${flagColumn} = false AND -- And reminder hasn't been sent
        t.completed = false
    `,
    [targetTime, targetTime - bufferInMs]
  );

  if (meetings.length === 0) {
    return { type: `${minutes}-min`, count: 0 };
  }

  // 2. Process them
  for (const meeting of meetings) {
    // A. Send the email
    await sendMeetingReminder({
      ...meeting,
      reminderType: `${minutes} minutes`,
    });

    // B. Create the in-app notification
    await pool.query(
      `
        INSERT INTO notifications (id, user_id, message, link, read, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
      `,
      [
        meeting.user_id,
        `${meeting.title} is starting in ${minutes} minutes.`,
        `/tasks?taskId=${meeting.id}`, // A link to open the task
      ]
    );

    // C. Mark the reminder as sent in the DB
    await pool.query(`UPDATE tasks SET ${flagColumn} = true WHERE id = $1`, [
      meeting.id,
    ]);
  }

  return { type: `${minutes}-min`, count: meetings.length };
}

// This is the main API route that Vercel will call
export async function GET() {
  try {
    const r30 = await processReminders(30, "reminder_30_sent");
    const r20 = await processReminders(20, "reminder_20_sent");
    const r10 = await processReminders(10, "reminder_10_sent");

    return NextResponse.json({
      success: true,
      remindersSent: [r30, r20, r10],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
