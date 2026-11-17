"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReview,
  getReviews,
  respondToReview,
  type CreateReviewInput,
} from "@/lib/api/reviews";

export function useReviews(sitterId?: string) {
  return useQuery({
    queryKey: ["reviews", sitterId ?? "all"],
    queryFn: () => getReviews(sitterId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewInput) => createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["sitter-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["sitter-summary"] });
    },
  });
}

export function useRespondToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      respondToReview(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
