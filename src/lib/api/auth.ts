import { ApiError, request } from "@/lib/api/client";
import type { AuthCredentials, RegisterPayload, SessionUser } from "@/types";

interface SessionResponse {
  user: SessionUser;
}

export async function loginUser(payload: AuthCredentials): Promise<SessionUser> {
  const response = await request<SessionResponse>({
    url: "/auth/login",
    method: "post",
    data: payload,
  });
  return response.user;
}

export async function registerUser(payload: RegisterPayload): Promise<SessionUser> {
  const response = await request<SessionResponse>({
    url: "/auth/register",
    method: "post",
    data: { ...payload, confirmPassword: payload.password, acceptTerms: true },
  });
  return response.user;
}

export async function logoutUser(): Promise<void> {
  await request<{ ok: boolean }>({ url: "/auth/logout", method: "post" });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const response = await request<SessionResponse>({ url: "/auth/session" });
    return response.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
