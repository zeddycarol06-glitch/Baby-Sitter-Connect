import { request } from "@/lib/api/client";
import type { Dispute } from "@/types";

export async function getDisputes(): Promise<Dispute[]> {
  return request<Dispute[]>({ url: "/disputes" });
}

export async function createDispute(payload: {
  bookingId: string;
  reason: string;
  description: string;
}): Promise<Dispute> {
  return request<Dispute>({ url: "/disputes", method: "post", data: payload });
}

export async function resolveDispute(
  id: string,
  status: Dispute["status"],
  resolution: string,
): Promise<Dispute> {
  return request<Dispute>({
    url: `/admin/disputes/${id}/resolve`,
    method: "post",
    data: { status, resolution },
  });
}
