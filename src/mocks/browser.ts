import { setupWorker } from "msw/browser";

type Worker = ReturnType<typeof setupWorker>;

const globalForMsw = globalThis as typeof globalThis & {
  __babysitterConnectWorker?: Worker;
  __babysitterConnectStart?: Promise<void>;
};

/**
 * Keep a single worker instance across Fast Refresh reloads. Creating a second
 * instance while the service worker is already registered leaves the page
 * without active handlers (requests fall through to the Next.js server).
 */
export const worker = globalForMsw.__babysitterConnectWorker ?? setupWorker();
globalForMsw.__babysitterConnectWorker = worker;

export interface MockWorkerOptions {
  onUnhandledRequest: "bypass" | "warn" | "error";
  serviceWorker: { url: string };
  quiet: boolean;
}

/**
 * Starts the mock worker (once per browser session) and always re-registers the
 * current handlers so hot-reloaded mock data is picked up without a reload.
 */
export async function startMockWorker(options: MockWorkerOptions): Promise<void> {
  const { handlers } = await import("./handlers");
  worker.resetHandlers(...handlers);

  if (!globalForMsw.__babysitterConnectStart) {
    globalForMsw.__babysitterConnectStart = worker.start(options).then(() => undefined);
  }
  await globalForMsw.__babysitterConnectStart;
}
