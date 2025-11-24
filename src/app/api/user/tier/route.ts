import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { getServerSession } from "next-auth/next";
import pool from "@/lib/db/serverDb";
import { PoolClient } from "pg"; // Import PoolClient

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // --- [THE FIX] ---
  let client: PoolClient | undefined;

  try {
    // 1. Move the connection *inside* the try block
    // This will now catch the 'ENOTFOUND' error when offline
    client = await pool.connect();

    // 2. Query the database
    const { rows } = await client.query(
      "SELECT tier FROM users WHERE id = $1", // Removed trial_started_at
      [userId]
    );
    // --- END OF FIX ---

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // Return the user's tier
    return NextResponse.json(
      {
        tier: user.tier,
      }, // Removed trial_started_at
      { status: 200 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // This block will now safely catch the offline error
    console.error("❌ Error fetching user tier:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 } // Stops the crash
    );
  } finally {
    // 3. Always release the client if it was successfully connected
    if (client) {
      client.release();
    }
  }
}
