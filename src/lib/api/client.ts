import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { API_URL, USE_MOCKS } from "@/lib/constants";
import { waitForMocks } from "@/lib/api/mock-ready";
import { useAuthStore } from "@/store/auth-store";
import type { ApiErrorBody } from "@/types";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(async (config) => {
  if (USE_MOCKS && typeof window !== "undefined") {
    await waitForMocks();
  }
  const user = useAuthStore.getState().user;
  if (user) {
    config.headers.set("x-user-id", user.id);
    config.headers.set("x-user-role", user.role);
    config.headers.set("x-user-email", encodeURIComponent(user.email));
    config.headers.set("x-user-name", encodeURIComponent(`${user.firstName} ${user.lastName}`));
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      (status === 0 ? "We couldn't reach the server. Check your connection and try again." : error.message);
    return Promise.reject(new ApiError(message, status, error.response?.data?.fieldErrors));
  },
);

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "message" in value;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config);
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (isApiErrorBody(error)) return error.message;
  return "Something went wrong. Please try again.";
}

export { client };
