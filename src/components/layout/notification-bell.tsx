"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types";

const DOT_COLORS: Record<NotificationType, string> = {
  booking: "bg-primary",
  message: "bg-sky-500",
  payment: "bg-emerald-500",
  verification: "bg-amber-500",
  system: "bg-violet-500",
};

export function NotificationBell({ className }: { className?: string }) {
  const { data, isPending } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const notifications = data ?? [];
  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 text-xs"
            onClick={() => markAll.mutate()}
            disabled={unread === 0 || markAll.isPending}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-80 overflow-y-auto">
          {isPending ? (
            <div className="space-y-3 p-3" aria-busy="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="bg-muted h-12 animate-pulse rounded-md" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((notification) => {
              const content = (
                <div
                  className={cn(
                    "hover:bg-muted/70 flex gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                    !notification.read && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT_COLORS[notification.type])}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{notification.title}</span>
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                      {notification.body}
                    </span>
                    <span className="text-muted-foreground/80 mt-1 block text-[11px]">
                      {formatRelative(notification.createdAt)}
                    </span>
                  </span>
                </div>
              );

              return (
                <div key={notification.id} className="px-1.5 py-0.5">
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      onClick={() => markRead.mutate(notification.id)}
                      className="block rounded-md"
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="block w-full rounded-md"
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      {content}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
