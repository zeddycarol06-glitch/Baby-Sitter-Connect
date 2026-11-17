"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getVerificationDocuments,
  getVerificationQueue,
  reviewVerificationDocument,
  uploadVerificationDocument,
} from "@/lib/api/verification";
import type { VerificationDocumentType } from "@/types";

export function useVerificationDocuments() {
  return useQuery({ queryKey: ["verification-documents"], queryFn: getVerificationDocuments });
}

export function useUploadVerificationDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: VerificationDocumentType; fileName: string }) =>
      uploadVerificationDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["sitter-profile"] });
    },
  });
}

export function useVerificationQueue() {
  return useQuery({ queryKey: ["verification-queue"], queryFn: getVerificationQueue });
}

export function useReviewVerificationDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      reason?: string;
    }) => reviewVerificationDocument(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["verification-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
