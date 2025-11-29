"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// We separate the logic into a sub-component to use Suspense safely
function SignInContent() {
  const isOnline = useOnlineStatus(); // 1. Check Internet
  const router = useRouter();
  const searchParams = useSearchParams(); // 2. Read URL params for errors

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 3. Check for specific Account Linking error on load
  useEffect(() => {
    const errorType = searchParams.get("error");
    if (errorType === "OAuthAccountNotLinked") {
      setError(
        "You already have an account with this email using a Password. Please log in with your Password below."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // 4. Block submission if offline
    if (!isOnline) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
        callbackUrl: "/app",
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password. Please try again.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
        setIsLoading(false);
      } else if (result?.ok && result.url) {
        router.push(result.url);
      } else {
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Sign-in exception:", err);
      setError("An error occurred during sign-in.");
      setIsLoading(false);
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
          Your Productivity Hub
        </h1>
        <p className="text-gray-600 text-center mb-8 text-sm">
          Log in or sign up for your TaskGlyph account
        </p>

        {/* 5. OFFLINE BANNER */}
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
            <span>You are currently offline. Please reconnect to sign in.</span>
          </div>
        )}

        {/* Google Login Button */}
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/app" })}
            // 6. Disable if offline
            disabled={!isOnline}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white transition duration-150 ease-in-out shadow-sm ${
              !isOnline
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            <FcGoogle className="text-xl" />
            <span className="text-sm font-medium">
              {!isOnline ? "Offline" : "Continue with Google"}
            </span>
          </button>
        </div>

        <div className="relative my-8">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Enter your email address..."
              disabled={isLoading || !isOnline}
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Password"
              disabled={isLoading || !isOnline}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={!isOnline}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isOnline}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {!isOnline
              ? "Waiting for Connection..."
              : isLoading
              ? "Signing In..."
              : "Continue with Email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to the TaskGlyph&nbsp;
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

// 7. Suspense Boundary for useSearchParams
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
