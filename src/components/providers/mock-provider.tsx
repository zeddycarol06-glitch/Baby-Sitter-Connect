"use client";

import { useState, type ReactNode } from "react";
import { API_URL, USE_MOCKS } from "@/lib/constants";
import { registerMocksReady } from "@/lib/api/mock-ready";

let mockPromise: Promise<void> | null = null;

function startMocks(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (mockPromise) return mockPromise;
  mockPromise = import("@/mocks/browser")
    .then(async ({ startMockWorker }) => {
      await startMockWorker({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
        quiet: true,
      });
      if (process.env.NODE_ENV === "development") {
        console.info(`[BabySitter Connect] Mock API enabled at ${API_URL}`);
      }
    })
    .catch((error: unknown) => {
      mockPromise = null;
      console.error("[BabySitter Connect] Failed to start the mock API", error);
    });
  return mockPromise;
}

export function MockProvider({ children }: { children: ReactNode }) {
  useState(() => {
    if (USE_MOCKS) registerMocksReady(startMocks());
    return null;
  });

  return <>{children}</>;
}
