"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const clear = useAuthStore((state) => state.clear);
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clear();
      router.replace("/login");
      router.refresh();
    }
  }, [clear, router]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated" && Boolean(user),
    isLoading: status === "loading",
    signOut,
  };
}
