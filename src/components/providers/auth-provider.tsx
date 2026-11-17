"use client";

import { useEffect } from "react";
import { getSession } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let cancelled = false;
    getSession()
      .then((user) => {
        if (cancelled) return;
        if (user) setUser(user);
        else clear();
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, [setUser, setStatus, clear]);

  return <>{children}</>;
}
