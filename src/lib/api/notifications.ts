import { request } from "@/lib/api/client";
import type { Notification } from "@/types";

export async function getNotifications(): Promise<Notification[]> {
  return request<Notification[]>({ url: "/notifications" });
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return request<Notification>({ url: `/notifications/${id}/read`, method: "post" });
}

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>({ url: "/notifications/read-all", method: "post" });
}
