"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChild,
  deleteChild,
  getChildren,
  getParentProfile,
  updateChild,
  updateParentProfile,
  type ChildInput,
} from "@/lib/api/parent";
import { getParentSummary } from "@/lib/api/bookings";
import type { ParentProfile } from "@/types";

export function useParentSummary() {
  return useQuery({ queryKey: ["parent-summary"], queryFn: getParentSummary });
}

export function useParentProfile() {
  return useQuery({ queryKey: ["parent-profile"], queryFn: getParentProfile });
}

export function useChildren() {
  return useQuery({ queryKey: ["children"], queryFn: getChildren, placeholderData: keepPreviousData });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChildInput) => createChild(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ChildInput> }) =>
      updateChild(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChild(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["parent-summary"] });
    },
  });
}

export function useUpdateParentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<ParentProfile> & { firstName?: string; lastName?: string; phone?: string },
    ) => updateParentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-profile"] });
    },
  });
}
