import { request } from "@/lib/api/client";
import type { VerificationDocument, VerificationDocumentType } from "@/types";

export async function getVerificationDocuments(): Promise<VerificationDocument[]> {
  return request<VerificationDocument[]>({ url: "/verification/documents" });
}

export async function uploadVerificationDocument(payload: {
  type: VerificationDocumentType;
  fileName: string;
}): Promise<VerificationDocument> {
  return request<VerificationDocument>({
    url: "/verification/documents",
    method: "post",
    data: payload,
  });
}

export async function getVerificationQueue(): Promise<VerificationDocument[]> {
  return request<VerificationDocument[]>({ url: "/admin/verification" });
}

export async function reviewVerificationDocument(
  id: string,
  status: "approved" | "rejected",
  reason?: string,
): Promise<VerificationDocument> {
  return request<VerificationDocument>({
    url: `/admin/verification/${id}/review`,
    method: "post",
    data: { status, reason },
  });
}
