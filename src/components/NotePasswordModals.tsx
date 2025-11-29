"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  WifiOff,
  Mail,
  KeyRound,
} from "lucide-react";
import db from "@/lib/db/clientDb";
import { useSession } from "next-auth/react";

/**
 * Modal for *creating* the notes password (First time setup)
 */
export function CreateNotePasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!navigator.onLine) {
      setError("You are offline. Cannot create a password.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", password }),
      });

      if (!res.ok) {
        throw new Error("Failed to set password");
      }

      if (session?.user?.id) {
        await db.userMetadata.update(session.user.id, {
          hasNotesPassword: true,
        });
      }

      onSuccess(password);
    } catch {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl w-96 p-8 border border-gray-100"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-indigo-50 rounded-full mb-3 text-indigo-600">
                <KeyRound size={28} />
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 text-center">
                Set Master Password
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 text-center mt-1">
                Protect your private notes with a secure password.
              </Dialog.Description>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all text-sm"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 p-2.5 rounded-lg text-xs font-medium">
                {error.includes("offline") ? <WifiOff size={14} /> : null}
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Password
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Modal for *verifying* AND *resetting* the notes password
 */
export function VerifyNotePasswordModal({
  onClose,
  onSuccess,
  initialMode = "verify", // ✅ NEW PROP: Allows defaulting to 'otp' mode
}: {
  onClose: () => void;
  onSuccess: (password: string) => void;
  initialMode?: "verify" | "otp";
}) {
  const [mode, setMode] = useState<"verify" | "otp">(initialMode);

  // Verify State
  const [password, setPassword] = useState("");

  // Reset State
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Auto-trigger OTP request if opened in 'otp' mode
  React.useEffect(() => {
    if (initialMode === "otp") {
      handleRequestOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Verify Password Logic
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      setError("You are offline. Cannot verify password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (
          res.status === 503 ||
          (data.error && data.error.includes("offline"))
        ) {
          throw new Error("You are offline. Cannot verify password.");
        }
        throw new Error(data.error || "Incorrect password");
      }

      onSuccess(password);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Incorrect password");
    }
    setLoading(false);
  };

  // 2. Request OTP Logic
  const handleRequestOtp = async () => {
    if (!navigator.onLine) {
      setError("You are offline. Cannot send email.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp" }),
      });
      if (!res.ok) throw new Error("Failed to send email");

      setMode("otp");
      setMessage("We sent a 6-digit code to your email.");
    } catch {
      setError("Failed to send email. Please try again.");
    }
    setLoading(false);
  };

  // 3. Reset Password Logic
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      setError("You are offline.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-with-otp",
          otp,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // Success! Unlock immediately with new password
      onSuccess(newPassword);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-96 p-8 border border-gray-100"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* HEADER */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`p-3 rounded-full mb-3 transition-colors ${
                mode === "verify"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {mode === "verify" ? <Lock size={28} /> : <Mail size={28} />}
            </div>
            <Dialog.Title className="text-xl font-bold text-gray-900 text-center">
              {mode === "verify" ? "Locked Note" : "Reset Password"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 text-center mt-1">
              {mode === "verify"
                ? "Enter your master password to unlock."
                : "Check your inbox for the verification code."}
            </Dialog.Description>
          </div>

          {/* --- MODE: VERIFY --- */}
          {mode === "verify" && (
            <form onSubmit={handleVerify}>
              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 text-sm transition-all"
                  placeholder="Enter password"
                  autoFocus
                  id="modal_verify_password_unique"
                  name="modal_verify_password_unique_field"
                  autoComplete="new-password"
                  readOnly={true} // Start as readonly
                  onFocus={(e) => e.target.removeAttribute("readonly")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 text-red-600 bg-red-50 p-2.5 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-1">
                  {error.includes("offline") ? <WifiOff size={14} /> : null}
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Unlock"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* --- MODE: OTP RESET --- */}
          {mode === "otp" && (
            <form
              onSubmit={handleReset}
              className="space-y-4"
              autoComplete="off"
            >
              {message && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2.5 rounded-lg text-xs font-medium">
                  <Mail size={14} /> {message}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  Verification Code
                </label>
                <input
                  type="text"
                  name="otp_code"
                  id="otp_code"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm tracking-widest font-mono text-center"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_note_password"
                  id="new_note_password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                  placeholder="Set new password"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium text-center">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("verify")}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Reset & Unlock"
                  )}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
