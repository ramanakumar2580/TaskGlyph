import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import pool from "@/lib/db/serverDb";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. GET LATEST SUCCESSFUL PAYMENT ID
      // Manam user last chesina payment id kavali refund cheyadaniki
      const paymentQuery = await client.query(
        `SELECT id, amount FROM payments 
         WHERE user_id = $1 AND status = 'success' 
         ORDER BY created_at DESC LIMIT 1`,
        [session.user.id]
      );

      if (paymentQuery.rows.length === 0) {
        // Payment history ledhu kani cancel chestunnadu (Maybe manual DB update?)
        // Just downgrade without refund
        await client.query("UPDATE users SET tier = 'free' WHERE id = $1", [
          session.user.id,
        ]);
        await client.query("COMMIT");
        return NextResponse.json({
          success: true,
          message: "Plan cancelled (No recent payment found to refund)",
        });
      }

      const lastPayment = paymentQuery.rows[0];
      const paymentId = lastPayment.id;

      // 2. INITIATE REFUND VIA RAZORPAY
      // Razorpay SDK vaduthunnam
      try {
        await razorpay.payments.refund(paymentId, {
          speed: "normal", // or 'optimum'
          notes: {
            reason: "User requested cancellation",
          },
        });
      } catch (razorpayError) {
        console.error("Razorpay Refund Failed:", razorpayError);
        // Optional: Fail the whole request if refund fails?
        // For now, let's assume we might want to cancel anyway, but strictly speaking:
        throw new Error("Refund failed directly at payment gateway");
      }

      // 3. UPDATE DB (Downgrade User)
      await client.query("UPDATE users SET tier = 'free' WHERE id = $1", [
        session.user.id,
      ]);

      // 4. UPDATE PAYMENT STATUS TO 'REFUNDED'
      await client.query(
        "UPDATE payments SET status = 'refunded' WHERE id = $1",
        [paymentId]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled & Refund initiated",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Cancellation Error:", err);
      return NextResponse.json(
        { error: "Failed to process refund/cancellation" },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
