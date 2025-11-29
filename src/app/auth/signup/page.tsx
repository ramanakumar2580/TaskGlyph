"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { FcGoogle } from "react-icons/fc"; // Using react-icons for consistency with SignIn
import { signIn } from "next-auth/react"; // Import signIn for Google
import { useOnlineStatus } from "@/hooks/useOnlineStatus"; // Import the hook

export default function SignUpPage() {
  const isOnline = useOnlineStatus(); // 1. Check Offline Status

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 2. Block if offline
    if (!isOnline) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // 3. Handle Duplicate Email (409 Conflict)
      if (response.status === 409) {
        setError(
          "You already have an account with this email. Please Sign In instead."
        );
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(
          data.error || `Registration failed (Status: ${response.status})`
        );
      } else {
        setSuccess("Registration successful! Redirecting to sign in...");
        setTimeout(() => router.push("/auth/signin"), 2000);
      }
    } catch (err) {
      console.error("Registration exception:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      if (!success) setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-10">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            TaskGlyph
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 text-center mb-2">
          Create Your Account
        </h1>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Start organizing your life, online or offline.
        </p>

        {/* 4. OFFLINE BANNER */}
        {!isOnline && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800 text-sm">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>You are offline. Please reconnect to sign up.</span>
          </div>
        )}

        {/* 5. Google Sign Up (Updated to use next-auth) */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/app" })}
          disabled={!isOnline}
          className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 transition mb-6 ${
            !isOnline
              ? "opacity-50 cursor-not-allowed bg-gray-50"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <FcGoogle className="text-xl" />
          {!isOnline ? "Offline" : "Continue with Google"}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Your Name (Optional)"
              disabled={isLoading || !isOnline}
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter your email address"
              disabled={isLoading || !isOnline}
            />
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Create a password (min. 6 characters)"
              disabled={isLoading || !isOnline}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={!isOnline}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Confirm your password"
              disabled={isLoading || !isOnline}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={!isOnline}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Error or success */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600 text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!success || !isOnline}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {!isOnline
              ? "Waiting for Connection..."
              : isLoading
              ? "Creating Account..."
              : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-gray-500">
          By signing up, you agree to the TaskGlyph&nbsp;
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms & Conditions
          </Link>
          &nbsp;and&nbsp;
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
