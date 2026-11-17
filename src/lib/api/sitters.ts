import { request } from "@/lib/api/client";
import type {
  Availability,
  Paginated,
  Payment,
  Payout,
  Review,
  SitterProfile,
  SitterSearchParams,
  SitterSummary,
  SitterWithAvailability,
  UpdateAvailabilityPayload,
} from "@/types";

export async function searchSitters(
  params: SitterSearchParams,
): Promise<Paginated<SitterWithAvailability>> {
  return request<Paginated<SitterWithAvailability>>({ url: "/sitters", params });
}

export async function getFeaturedSitters(): Promise<SitterProfile[]> {
  return request<SitterProfile[]>({ url: "/sitters/featured" });
}

export async function getSitter(id: string): Promise<SitterProfile> {
  return request<SitterProfile>({ url: `/sitters/${id}` });
}

export async function getSitterReviews(sitterId: string): Promise<Review[]> {
  return request<Review[]>({ url: `/sitters/${sitterId}/reviews` });
}

export async function getSitterAvailability(sitterId: string): Promise<Availability[]> {
  return request<Availability[]>({ url: `/sitters/${sitterId}/availability` });
}

export async function updateSitterAvailability(
  sitterId: string,
  payload: UpdateAvailabilityPayload,
): Promise<Availability[]> {
  return request<Availability[]>({
    url: `/sitters/${sitterId}/availability`,
    method: "put",
    data: payload,
  });
}

export async function getSitterSummary(): Promise<SitterSummary> {
  return request<SitterSummary>({ url: "/sitter/summary" });
}

export async function getSitterProfile(): Promise<SitterProfile> {
  return request<SitterProfile>({ url: "/sitter/profile" });
}

export async function updateSitterProfile(
  payload: Partial<SitterProfile>,
): Promise<SitterProfile> {
  return request<SitterProfile>({ url: "/sitter/profile", method: "patch", data: payload });
}

export async function getPayments(): Promise<Payment[]> {
  return request<Payment[]>({ url: "/payments" });
}

export async function getPayouts(): Promise<Payout[]> {
  return request<Payout[]>({ url: "/payouts" });
}
