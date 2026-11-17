"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDispute, getDisputes, resolveDispute } from "@/lib/api/disputes";
import type { Dispute } from "@/types";

export function useDisputes() {
  return useQuery({ queryKey: ["disputes"], queryFn: getDisputes });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { bookingId: string; reason: string; description: string }) =>
      createDispute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolution,
    }: {
      id: string;
      status: Dispute["status"];
      resolution: string;
    }) => resolveDispute(id, status, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
}
