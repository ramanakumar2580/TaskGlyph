import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Basic Auth Check
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  try {
    const body = await request.json();
    const { action, password, otp } = body;

    // ---------------------------------------------------------
    // 1. ACTION: SET (Create or Change Password Manually)
    // ---------------------------------------------------------
    if (action === "set") {
      if (!password)
        return NextResponse.json(
          { error: "Missing password" },
          { status: 400 }
        );

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET notes_password_hash = $1 WHERE id = $2`,
        [hashedPassword, userId]
      );

      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------
    // 2. ACTION: VERIFY (Check Password to Unlock Note)
    // ---------------------------------------------------------
    if (action === "verify") {
      if (!password)
        return NextResponse.json(
          { error: "Missing password" },
          { status: 400 }
        );

      // Get stored hash
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

    // ---------------------------------------------------------
    // 3. ACTION: SEND OTP (Forgot Password Request)
    // ---------------------------------------------------------
    if (action === "send-otp") {
      // Generate a 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiry to 10 minutes from now
      const expiry = Date.now() + 10 * 60 * 1000;

      // Store code and expiry in the database
      await pool.query(
        `UPDATE users SET notes_reset_code = $1, notes_reset_expiry = $2 WHERE id = $3`,
        [code, expiry, userId]
      );

      // Send the email via Resend
      await resend.emails.send({
        from: "TaskGlyph Security <onboarding@resend.dev>", // Or your verified domain
        to: userEmail,
        subject: "Your Reset Code for TaskGlyph Notes",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Reset Your Notes Password</h2>
            <p>You requested to reset your secure notes password. Use the code below:</p>
            <h1 style="background: #f4f4f5; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px;">${code}</h1>
            <p style="color: #666; margin-top: 20px;">This code expires in 10 minutes.</p>
            <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true });
    }

    // ---------------------------------------------------------
    // 4. ACTION: RESET WITH OTP (Verify Code & Set New Password)
    // ---------------------------------------------------------
    if (action === "reset-with-otp") {
      if (!otp || !password) {
        return NextResponse.json(
          { error: "Missing OTP or new password" },
          { status: 400 }
        );
      }

      // Retrieve the stored code and expiry
      const { rows } = await pool.query(
        `SELECT notes_reset_code, notes_reset_expiry FROM users WHERE id = $1`,
        [userId]
      );

      if (rows.length === 0 || !rows[0].notes_reset_code) {
        return NextResponse.json(
          { error: "No reset requested" },
          { status: 400 }
        );
      }

      const storedCode = rows[0].notes_reset_code;
      const expiry = parseInt(rows[0].notes_reset_expiry);

      // Verify Code
      if (storedCode !== otp) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Verify Expiry
      if (Date.now() > expiry) {
        return NextResponse.json(
          { error: "Code expired. Request a new one." },
          { status: 400 }
        );
      }

      // Code is valid! Update the password and clear the reset fields
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `UPDATE users 
         SET notes_password_hash = $1, 
             notes_reset_code = NULL, 
             notes_reset_expiry = NULL 
         WHERE id = $2`,
        [hashedPassword, userId]
      );

      return NextResponse.json({ success: true });
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
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
