import type { NextAuthOptions, User } from "next-auth"; // Import User type
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // 1. Import CredentialsProvider
import pool from "@/lib/db/serverDb";
import bcrypt from "bcrypt"; // 2. Import bcrypt

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // 3. Add CredentialsProvider
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          console.error("Credentials missing");
          return null;
        }

        try {
          // Find user by email in your Neon DB
          const { rows } = await pool.query(
            "SELECT id, email, name, password FROM users WHERE email = $1",
            [credentials.email.toLowerCase()] // Normalize email to lowercase
          );

          if (rows.length === 0) {
            console.log("No user found with that email");
            return null; // User not found
          }

          const user = rows[0];

          // Check if user signed up with Google (no password)
          if (!user.password) {
            console.log(
              "User signed up via Google, password login not possible"
            );
            // Optionally: You could throw an error here to give specific feedback
            // throw new Error("Please sign in using Google.");
            return null;
          }

          // Verify the password using bcrypt
          const passwordIsValid = await bcrypt.compare(
            credentials.password,
            user.password // The hashed password from your DB
          );

          if (!passwordIsValid) {
            console.log("Invalid password");
            return null; // Incorrect password
          }

          console.log("✅ Password validation successful for:", user.email);

          // Return the user object (must include id, can include name, email)
          // NextAuth uses this object to create the session/token
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("❌ DB error during authorization:", error);
          return null; // Return null on error
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
    // You might want to add error page:
    // error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Persist the user ID from either Google or Credentials login to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        // Ensure token.id exists
        session.user.id = token.id as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Google sign-in logic (remains the same)
      if (account?.provider === "google" && user.email) {
        const userId = user.id as string;
        try {
          const { rows } = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [userId]
          );
          if (rows.length === 0) {
            await pool.query(
              `INSERT INTO users (id, email, name, tier)
               VALUES ($1, $2, $3, $4)`,
              [userId, user.email, user.name || null, "free"]
            );
            console.log("✅ New Google user created:", userId);
          }
        } catch (error) {
          console.error("❌ DB error during Google sign-in:", error);
          return false;
        }
      }

      return true;
    },
  },
};
