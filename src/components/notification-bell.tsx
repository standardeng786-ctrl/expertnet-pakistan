"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const supabase = createClient();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, [supabase]);

  useEffect(() => {
    if (!loggedIn) return;
    const load = () => fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications ?? []));
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  if (!loggedIn) return null;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-white hover:text-gold-light" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-md shadow-lg border z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 && <p className="p-4 text-sm text-gray-500">No notifications.</p>}
          {notifications.map((n) => (
            <a
              key={n.id}
              href={n.link ?? "#"}
              onClick={() => markRead(n.id)}
              className={`block px-4 py-3 border-b text-sm hover:bg-gray-50 ${!n.read_at ? "bg-gray-50 font-medium" : ""}`}
            >
              <p>{n.title}</p>
              {n.body && <p className="text-xs text-gray-500">{n.body}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
