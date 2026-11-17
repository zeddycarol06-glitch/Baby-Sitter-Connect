import { request } from "@/lib/api/client";
import type {
  AdminOverview,
  AdminReportRow,
  AdminSettings,
  Booking,
  Paginated,
  Payment,
  User,
} from "@/types";

export async function getAdminOverview(): Promise<AdminOverview> {
  return request<AdminOverview>({ url: "/admin/overview" });
}

export interface AdminUserParams {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminUsers(params?: AdminUserParams): Promise<Paginated<User>> {
  return request<Paginated<User>>({ url: "/admin/users", params });
}

export async function updateUserStatus(
  id: string,
  status: User["status"],
): Promise<User> {
  return request<User>({ url: `/admin/users/${id}/status`, method: "patch", data: { status } });
}

export interface AdminTableParams {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminBookings(params?: AdminTableParams): Promise<Paginated<Booking>> {
  return request<Paginated<Booking>>({ url: "/admin/bookings", params });
}

export async function getAdminPayments(params?: AdminTableParams): Promise<Paginated<Payment>> {
  return request<Paginated<Payment>>({ url: "/admin/payments", params });
}

export async function getAdminReports(): Promise<AdminReportRow[]> {
  return request<AdminReportRow[]>({ url: "/admin/reports" });
}

export async function getAdminSettings(): Promise<AdminSettings> {
  return request<AdminSettings>({ url: "/admin/settings" });
}

export async function updateAdminSettings(
  payload: Partial<AdminSettings>,
): Promise<AdminSettings> {
  return request<AdminSettings>({ url: "/admin/settings", method: "put", data: payload });
}
