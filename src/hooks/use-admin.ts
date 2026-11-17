"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBookings,
  getAdminOverview,
  getAdminPayments,
  getAdminReports,
  getAdminSettings,
  getAdminUsers,
  updateAdminSettings,
  updateUserStatus,
  type AdminTableParams,
  type AdminUserParams,
} from "@/lib/api/admin";
import type { AdminSettings, User } from "@/types";

export function useAdminOverview() {
  return useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview });
}

export function useAdminUsers(params?: AdminUserParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: User["status"] }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useAdminBookings(params?: AdminTableParams) {
  return useQuery({
    queryKey: ["admin-bookings", params],
    queryFn: () => getAdminBookings(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPayments(params?: AdminTableParams) {
  return useQuery({
    queryKey: ["admin-payments", params],
    queryFn: () => getAdminPayments(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReports() {
  return useQuery({ queryKey: ["admin-reports"], queryFn: getAdminReports });
}

export function useAdminSettings() {
  return useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AdminSettings>) => updateAdminSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(["admin-settings"], settings);
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });
}
