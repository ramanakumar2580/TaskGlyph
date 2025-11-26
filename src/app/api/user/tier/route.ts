import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options"; // Make sure this path is correct
import { getServerSession } from "next-auth/next";
import pool from "@/lib/db/serverDb";
import { PoolClient } from "pg";

export const dynamic = "force-dynamic"; // Ensure this doesn't get cached statically

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  let client: PoolClient | undefined;

  try {
    // 1. Connect to Database
    client = await pool.connect();

    // 2. Query the User's Tier and Trial Info
    const { rows } = await client.query(
      "SELECT tier, trial_started_at FROM users WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // 3. Return Data
    return NextResponse.json(
      {
        tier: user.tier || "free",
        // Convert BigInt to number/string for JSON safety
        trialStartedAt: user.trial_started_at
          ? Number(user.trial_started_at)
          : null,
      },
      { status: 200 }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error fetching user tier:", error.message);

    // If DB is down, return 500 but frontend handles it gracefully (keeps local tier)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
