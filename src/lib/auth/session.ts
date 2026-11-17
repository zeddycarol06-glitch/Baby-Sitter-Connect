import type { SessionUser } from "@/types";

export const SESSION_COOKIE = "bs_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function encodeSession(user: SessionUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeSession(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (!isSessionUser(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isSessionUser(value: unknown): value is SessionUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.firstName === "string" &&
    typeof candidate.lastName === "string" &&
    (candidate.role === "parent" || candidate.role === "sitter" || candidate.role === "admin")
  );
}
