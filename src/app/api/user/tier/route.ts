// src/app/api/user/tier/route.ts
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth/next";
import pool from "@/lib/db/serverDb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Query the database for the user's tier
    const { rows } = await pool.query(
      "SELECT tier, trial_started_at FROM users WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // Return the user's tier
    return NextResponse.json(
      {
        tier: user.tier,
        trial_started_at: user.trial_started_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching user tier:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
