import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db/serverDb"; // Import your Neon DB pool

export const authOptions: NextAuthOptions = {
  // Define all your providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // Set the strategy to JWT
  session: {
    strategy: "jwt",
  },

  // Set your secret
  secret: process.env.NEXTAUTH_SECRET,

  // Add your sign-in page
  pages: {
    signIn: "/auth/signin",
  },

  // Define the callbacks
  callbacks: {
    // 1. This 'jwt' callback runs when a JWT is created (on sign-in).
    // We add the user's ID to the token here.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // 2. This 'session' callback runs when a session is checked.
    // We add the 'id' from the token to the session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    // 3. This 'signIn' callback runs when a user signs in.
    // This is where you save the user to your Neon DB.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const userId = user.id as string;

        try {
          const { rows } = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [userId]
          );

          if (rows.length === 0) {
            // New user → set tier = 'free' permanently
            await pool.query(
              `INSERT INTO users (id, email, name, tier) 
               VALUES ($1, $2, $3, $4)`,
              [userId, user.email, user.name || null, "free"]
            );
            console.log("✅ New free user created:", userId);
          }
        } catch (error) {
          console.error("❌ DB error during sign-in:", error);
          return false;
        }
      }
      return true;
    },
  },
};
