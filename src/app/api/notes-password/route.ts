import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { action, password } = body;

    if (!action || !password) {
      return NextResponse.json(
        { error: "Missing action or password" },
        { status: 400 }
      );
    }

    // --- ACTION: SET (Create or Change Password) ---
    if (action === "set") {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `UPDATE users SET notes_password_hash = $1 WHERE id = $2`,
        [hashedPassword, userId]
      );

      return NextResponse.json({ success: true });
    }

    // --- ACTION: VERIFY (Check Password) ---
    if (action === "verify") {
      // 1. Get the user's stored hash
      const { rows } = await pool.query(
        `SELECT notes_password_hash FROM users WHERE id = $1`,
        [userId]
      );

      if (rows.length === 0 || !rows[0].notes_password_hash) {
        return NextResponse.json(
          { error: "Password not set" },
          { status: 404 }
        );
      }

      const hash = rows[0].notes_password_hash;

      // 2. Compare the provided password with the stored hash
      const isCorrect = await bcrypt.compare(password, hash);

      if (isCorrect) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { success: false, error: "Incorrect password" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Notes password API error:", error);

    // ✅ CHECK: Is the Database Unreachable? (Offline simulation)
    if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED" ||
      error.code === "EAI_AGAIN"
    ) {
      return NextResponse.json(
        { error: "You are offline. Cannot verify password." },
        { status: 503 } // 503 Service Unavailable
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
