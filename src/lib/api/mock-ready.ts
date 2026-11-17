let mockReady: Promise<void> | null = null;

export function registerMocksReady(promise: Promise<void>): void {
  mockReady = promise;
}

export async function waitForMocks(): Promise<void> {
  if (mockReady) await mockReady;
}
