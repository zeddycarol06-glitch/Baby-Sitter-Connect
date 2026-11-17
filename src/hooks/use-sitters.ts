"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFeaturedSitters,
  getPayouts,
  getPayments,
  getSitter,
  getSitterAvailability,
  getSitterProfile,
  getSitterReviews,
  getSitterSummary,
  searchSitters,
  updateSitterAvailability,
  updateSitterProfile,
} from "@/lib/api/sitters";
import type { SitterProfile, SitterSearchParams, UpdateAvailabilityPayload } from "@/types";

export function useSitters(params: SitterSearchParams) {
  return useQuery({
    queryKey: ["sitters", params],
    queryFn: () => searchSitters(params),
    placeholderData: keepPreviousData,
  });
}

export function useFeaturedSitters() {
  return useQuery({ queryKey: ["sitters", "featured"], queryFn: getFeaturedSitters });
}

export function useSitter(id: string) {
  return useQuery({
    queryKey: ["sitter", id],
    queryFn: () => getSitter(id),
    enabled: Boolean(id),
  });
}

export function useSitterReviews(sitterId: string) {
  return useQuery({
    queryKey: ["sitter-reviews", sitterId],
    queryFn: () => getSitterReviews(sitterId),
    enabled: Boolean(sitterId),
  });
}

export function useSitterAvailability(sitterId: string) {
  return useQuery({
    queryKey: ["sitter-availability", sitterId],
    queryFn: () => getSitterAvailability(sitterId),
    enabled: Boolean(sitterId),
  });
}

export function useUpdateAvailability(sitterId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAvailabilityPayload) => updateSitterAvailability(sitterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitter-availability", sitterId] });
    },
  });
}

export function useSitterSummary() {
  return useQuery({ queryKey: ["sitter-summary"], queryFn: getSitterSummary });
}

export function useSitterProfile() {
  return useQuery({ queryKey: ["sitter-profile"], queryFn: getSitterProfile });
}

export function useUpdateSitterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SitterProfile>) => updateSitterProfile(payload),
    onSuccess: (sitter) => {
      queryClient.setQueryData(["sitter-profile"], sitter);
      queryClient.invalidateQueries({ queryKey: ["sitter-summary"] });
    },
  });
}

export function useSitterPayments() {
  return useQuery({ queryKey: ["payments"], queryFn: getPayments });
}

export function usePayouts() {
  return useQuery({ queryKey: ["payouts"], queryFn: getPayouts });
}
