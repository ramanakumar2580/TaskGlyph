import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/serverDb"; // Your Neon DB connection
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // To generate a unique user ID

// Define expected request body structure (optional but good practice)
interface RegisterRequestBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, name } = body;

    // --- Basic Validation ---
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    // Very simple password length check (you might want more complex rules)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }
    // Basic email format check (optional, client-side usually handles this)
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    // --- End Validation ---

    const lowerCaseEmail = email.toLowerCase(); // Store emails consistently

    // --- Check if user already exists ---
    const { rows: existingUsers } = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [lowerCaseEmail]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 } // 409 Conflict status code
      );
    }
    // --- End Check ---

    // --- Hash Password ---
    const saltRounds = 10; // Standard salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // --- End Hashing ---

    // --- Create New User ---
    const newUserId = uuidv4(); // Generate a unique ID
    await pool.query(
      `INSERT INTO users (id, email, name, password, tier)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUserId, lowerCaseEmail, name || null, hashedPassword, "free"] // Default to 'free' tier
    );
    console.log("✅ New email user created:", newUserId, lowerCaseEmail);
    // --- End Creation ---

    // Return success response (don't return password!)
    return NextResponse.json(
      { message: "User created successfully", userId: newUserId },
      { status: 201 } // 201 Created status code
    );
  } catch (error) {
    console.error("❌ Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
