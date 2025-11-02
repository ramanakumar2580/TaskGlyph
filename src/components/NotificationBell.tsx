// src/components/NotificationBell.tsx
"use client";

import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUnreadNotifications } from "@/lib/db/useNotifications";
import db from "@/lib/db/clientDb"; // Import the db instance

export default function NotificationBell() {
  const unreadNotifs = useUnreadNotifications();
  const unreadCount = unreadNotifs.length;

  const markAsRead = async (id: string) => {
    await db.notifications.update(id, { read: true });
    // Note: We don't need to trigger sync for this,
    // it's a client-only "read" status.
  };

  return (
    <Popover className="relative">
      <Popover.Button className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {/* Red Dot */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-3 w-screen max-w-xs transform px-4 sm:px-0">
          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
            <div className="relative grid gap-4 bg-white p-4">
              <h3 className="text-base font-medium text-gray-900">
                Notifications
              </h3>
              {unreadCount === 0 ? (
                <p className="text-sm text-gray-500">
                  You&apos;re all caught up!
                </p>
              ) : (
                <ul className="max-h-60 overflow-y-auto space-y-2">
                  {unreadNotifs.map((notif) => (
                    <li
                      key={notif.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => markAsRead(notif.id)}
                        title="Dismiss"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-700" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
