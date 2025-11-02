// src/components/AppNavbar.tsx
"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ListBulletIcon,
  PencilIcon,
  BookOpenIcon,
  ClockIcon,
  UserCircleIcon,
  HomeIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useTier } from "@/lib/db/useTier";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell"; // <-- [NEW] Import the bell

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AppNavbar() {
  const { data: session } = useSession();
  const tier = useTier();
  const pathname = usePathname();

  const appLinks = [
    { name: "Home", href: "/app", icon: HomeIcon },
    { name: "Tasks", href: "/app/tasks", icon: ListBulletIcon },
    { name: "Notes", href: "/app/notes", icon: PencilIcon },
    { name: "Diary", href: "/app/diary", icon: BookOpenIcon },
    { name: "Pomodoro", href: "/app/pomodoro", icon: ClockIcon },
    { name: "Dashboard", href: "/app/dashboard", icon: ChartBarIcon },
  ];

  return (
    <Disclosure
      as="nav"
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16">
              {/* Left Side: Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/app">
                  <Image
                    src="/logo.png" // Using logo3.png
                    alt="TaskGlyph Logo"
                    width={150}
                    height={32}
                    className="h-40 w-auto"
                  />
                </Link>
              </div>

              {/* Center: App Links (Desktop) */}
              <div className="hidden sm:flex flex-1 items-center justify-center space-x-8">
                {appLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon
                        className={classNames(
                          isActive ? "text-blue-500" : "text-gray-400",
                          "h-5 w-5 mr-1.5"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Right Side: Tier & Profile (Desktop) */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center flex-shrink-0">
                <span
                  className={classNames(
                    "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium mr-4",
                    tier === "free"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  )}
                >
                  {tier
                    ? `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`
                    : "Loading..."}
                </span>

                {/* --- [NEW] Notification Bell (Desktop) --- */}
                <div className="mr-3">
                  <NotificationBell />
                </div>

                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex items-center text-sm rounded-full hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <span className="sr-only">Open user menu</span>
                      {session?.user?.image ? (
                        <Image
                          className="h-9 w-9 rounded-full"
                          src={session.user.image}
                          alt="Profile picture"
                          width={36}
                          height={36}
                        />
                      ) : (
                        <UserCircleIcon className="h-9 w-9 text-gray-400" />
                      )}
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-1" />
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
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/app/settings"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "w-full text-left flex items-center px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              {/* Mobile Menu Button */}
              <div className="-mr-2 flex items-center sm:hidden">
                {/* --- [NEW] Notification Bell (Mobile) --- */}
                <div className="mr-2">
                  <NotificationBell />
                </div>

                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
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

          {/* Mobile Menu Panel (Slides down) */}
          <Disclosure.Panel className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {appLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={classNames(
                      isActive
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                      "flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon
                      className={classNames(
                        isActive ? "text-blue-500" : "text-gray-400",
                        "h-6 w-6 mr-3"
                      )}
                    />
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
            {/* Profile Section in Mobile Menu */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt="Profile picture"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
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
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  as={Link}
                  href="/app/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Disclosure.Button>
                <Disclosure.Button
                  as="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <ArrowRightEndOnRectangleIcon className="h-6 w-6 mr-2" />
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
