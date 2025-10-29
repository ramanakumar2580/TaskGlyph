"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          TaskGlyph
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Sign in to your account
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Your data stays private. Free tier = offline only.
        </p>
      </div>
    </div>
  );
}
