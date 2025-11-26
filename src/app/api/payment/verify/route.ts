import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options"; // Nee auth options path verify chesko
import pool from "@/lib/db/serverDb"; // Neon DB Pool

export async function POST(req: Request) {
  try {
    // 1. Get Current User Session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan_name,
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // 2. Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // ✅ 3. UPDATE USER TIER IN NEON DB
        // Plan name ni lowercase lo save chestunnam (basic, pro, ultra)
        const tierValue = plan_name.toLowerCase();

        await client.query(`UPDATE users SET tier = $1 WHERE email = $2`, [
          tierValue,
          session.user.email,
        ]);

        // ✅ 4. LOG TRANSACTION IN PAYMENTS TABLE
        // Amount ni simple ga plan batti fix cheddam or frontend nunchi techukovachu.
        // Ikkada logic simple ga unchadaniki '0' pedutunna temporarily or generic.
        await client.query(
          `INSERT INTO payments (id, user_id, order_id, amount, plan_name, status)
             VALUES ($1, (SELECT id FROM users WHERE email = $2), $3, $4, $5, 'success')
             ON CONFLICT (id) DO NOTHING`,
          [
            razorpay_payment_id,
            session.user.email,
            razorpay_order_id,
            0,
            tierValue,
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          message: "Payment verified and DB updated",
          success: true,
        });
      } catch (dbError) {
        await client.query("ROLLBACK");
        console.error("DB Update Error:", dbError);
        return NextResponse.json(
          { error: "DB Update Failed" },
          { status: 500 }
        );
      } finally {
        client.release();
      }
    } else {
      return NextResponse.json(
        { message: "Invalid signature", success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
