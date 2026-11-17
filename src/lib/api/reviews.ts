import { request } from "@/lib/api/client";
import type { Review } from "@/types";

export async function getReviews(sitterId?: string): Promise<Review[]> {
  return request<Review[]>({ url: "/reviews", params: sitterId ? { sitterId } : undefined });
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment: string;
}

export async function createReview(payload: CreateReviewInput): Promise<Review> {
  return request<Review>({ url: "/reviews", method: "post", data: payload });
}

export async function respondToReview(id: string, response: string): Promise<Review> {
  return request<Review>({ url: `/reviews/${id}/response`, method: "post", data: { response } });
}
