"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Lock, Eye, EyeOff, WifiOff } from "lucide-react"; // Added WifiOff icon
import db from "@/lib/db/clientDb";
import { useSession } from "next-auth/react";

/**
 * Modal for *creating* the notes password
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

    // --- 1. Offline Check for Creation too (Optional but good) ---
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl w-96 p-6"
          >
            <Dialog.Title className="text-lg font-semibold mb-2 text-center">
              Create Notes Password
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4 text-center">
              This password will protect all your locked notes.
            </Dialog.Description>

            {/* Password Input */}
            <div className="mb-3">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirm"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none flex items-center disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Set Password
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Modal for *verifying* the notes password
 */
export function VerifyNotePasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ --- [THE FIX: CHECK OFFLINE STATUS] ---
    if (!navigator.onLine) {
      setError("You are offline. Cannot verify password.");
      return; // STOP execution here
    }

    setLoading(true);

    try {
      const res = await fetch("/api/notes-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", password }),
      });

      const data = await res.json(); // Safely parse JSON

      if (
        res.status === 503 ||
        (data.error && data.error.includes("offline"))
      ) {
        // Handle server saying "I can't reach DB"
        setError("You are offline. Cannot verify password.");
      } else if (res.status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (!res.ok) {
        throw new Error("Verification failed");
      } else {
        // Success!
        onSuccess(password);
      }
    } catch (err) {
      // Catch network errors (e.g. if browser goes offline mid-request)
      console.error(err);
      setError("Connection error. Please check your internet.");
    }
    setLoading(false);
  };

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl w-96 p-6"
          >
            <div className="flex flex-col items-center">
              <Lock className="w-12 h-12 mb-4 text-gray-500" />
              <Dialog.Title className="text-lg font-semibold mb-2">
                Note Locked
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                Enter your notes password to continue.
              </Dialog.Description>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Error Message with Icon */}
            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 p-2 rounded-md">
                {error.includes("offline") || error.includes("Connection") ? (
                  <WifiOff size={14} />
                ) : null}
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none flex items-center disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Unlock
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
