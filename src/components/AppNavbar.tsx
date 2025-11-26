// src/components/AppNavbar.tsx
"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  ListBulletIcon,
  PencilIcon,
  BookOpenIcon,
  ClockIcon,
  HomeIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightEndOnRectangleIcon,
  SparklesIcon,
  XCircleIcon, // Icon for Cancel
} from "@heroicons/react/24/outline";
import { useTier } from "@/lib/db/useTier";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";
import db from "@/lib/db/clientDb"; // ✅ Import DB for local updates

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppNavbar() {
  const { data: session } = useSession();
  const tier = useTier();
  const pathname = usePathname();
  const [isCancelling, setIsCancelling] = useState(false);

  // Normalize tier string
  const currentTier = (tier || "free").toLowerCase();

  const appLinks = [
    { name: "Home", href: "/app", icon: HomeIcon },
    { name: "Tasks", href: "/app/tasks", icon: ListBulletIcon },
    { name: "Notes", href: "/app/notes", icon: PencilIcon },
    { name: "Diary", href: "/app/diary", icon: BookOpenIcon },
    { name: "Pomodoro", href: "/app/pomodoro", icon: ClockIcon },
    { name: "Dashboard", href: "/app/dashboard", icon: ChartBarIcon },
  ];

  // Badge Styles Helper
  const getBadgeStyles = (t: string) => {
    switch (t) {
      case "ultra":
        return "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-sm";
      case "pro":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "basic":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // 🔥 HANDLE CANCEL SUBSCRIPTION LOGIC
  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your plan? You will lose premium benefits immediately, and a refund will be initiated."
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      // 1. Call API to Cancel & Refund
      const res = await fetch("/api/payment/cancel", { method: "POST" });

      if (res.ok) {
        // 2. Update Local DB (Dexie)
        await db.userSettings.put({
          id: "me",
          tier: "free",
          email: session?.user?.email || "",
        });

        // 3. Optional: Update metadata
        if (session?.user?.id) {
          const meta = await db.userMetadata.get(session.user.id);
          if (meta) {
            await db.userMetadata.put({ ...meta, tier: "free" });
          }
        }

        alert(
          "Subscription cancelled. Refund initiated to your original payment method (takes 5-7 days)."
        );
        window.location.reload(); // Refresh to show Free tier UI
      } else {
        alert("Failed to cancel. Please try again later.");
      }
    } catch (error) {
      console.error("Cancel error", error);
      alert("Something went wrong.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Disclosure
      as="nav"
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16">
              {/* --- LOGO --- */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/app">
                  <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    TaskGlyph
                  </span>
                </Link>
              </div>

              {/* --- DESKTOP NAVIGATION LINKS --- */}
              <div className="hidden sm:flex flex-1 items-center justify-center space-x-4 lg:space-x-8">
                {appLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isActive ? "text-indigo-500" : "text-gray-400",
                          "h-5 w-5 mr-1.5"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* --- RIGHT SIDE ACTIONS --- */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center flex-shrink-0 gap-3">
                {/* Tier Badge */}
                <Link href="/app/pricing">
                  <span
                    className={classNames(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-transform hover:scale-105 cursor-pointer",
                      getBadgeStyles(currentTier)
                    )}
                  >
                    {currentTier === "ultra" && (
                      <SparklesIcon className="w-3 h-3 mr-1" />
                    )}
                    {currentTier}
                  </span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <NotificationBell />
                </div>

                {/* User Dropdown Menu */}
                <Menu as="div" className="relative ml-1">
                  <div>
                    <Menu.Button className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      {session?.user?.image ? (
                        <Image
                          className="h-9 w-9 rounded-full ring-2 ring-gray-100"
                          src={session.user.image}
                          alt=""
                          width={36}
                          height={36}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {session?.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>

                      {/* Upgrade Option (If not Ultra) */}
                      {currentTier !== "ultra" && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/app/pricing"
                              className={classNames(
                                active ? "bg-indigo-50" : "",
                                "flex items-center px-4 py-2 text-sm text-indigo-600 font-semibold"
                              )}
                            >
                              <SparklesIcon className="h-4 w-4 mr-2" /> Upgrade
                              Plan
                            </Link>
                          )}
                        </Menu.Item>
                      )}

                      {/* 🔥 CANCEL SUBSCRIPTION (If Paid) */}
                      {currentTier !== "free" && (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleCancelSubscription}
                              disabled={isCancelling}
                              className={classNames(
                                active ? "bg-red-50" : "",
                                "w-full text-left flex items-center px-4 py-2 text-sm text-red-600 font-medium"
                              )}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              {isCancelling ? "Cancelling..." : "Cancel Plan"}
                            </button>
                          )}
                        </Menu.Item>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "w-full text-left flex items-center px-4 py-2 text-sm text-gray-600"
                            )}
                          >
                            <ArrowRightEndOnRectangleIcon className="h-4 w-4 mr-2" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              {/* --- MOBILE MENU BUTTON --- */}
              <div className="-mr-2 flex items-center sm:hidden">
                <div className="mr-2">
                  <NotificationBell />
                </div>
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* --- MOBILE MENU PANEL --- */}
          <Disclosure.Panel className="sm:hidden border-t border-gray-200">
            <div className="space-y-1 pt-2 pb-3">
              {appLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                      "block border-l-4 py-2 pl-3 pr-4 text-base font-medium flex items-center gap-3"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>

            {/* Mobile Profile Section */}
            <div className="border-t border-gray-200 pt-4 pb-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session?.user?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {session?.user?.email}
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className={classNames(
                      "px-2 py-1 rounded text-xs font-bold uppercase",
                      getBadgeStyles(currentTier)
                    )}
                  >
                    {currentTier}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {currentTier !== "ultra" && (
                  <Disclosure.Button
                    as={Link}
                    href="/app/pricing"
                    className="block px-4 py-2 text-base font-medium text-indigo-600 hover:bg-gray-100"
                  >
                    Upgrade Plan
                  </Disclosure.Button>
                )}

                {/* 🔥 MOBILE CANCEL BUTTON */}
                {currentTier !== "free" && (
                  <Disclosure.Button
                    as="button"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Disclosure.Button>
                )}

                <Disclosure.Button
                  as="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
