import { NextResponse, type NextRequest } from "next/server";
import { loginSchema } from "@/schemas/auth";
import { findUserByEmail, toSessionUser } from "@/lib/auth/demo-users";
import { encodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import type { ApiErrorBody } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorBody>({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiErrorBody>(
      { message: "Please check the form and try again" },
      { status: 400 },
    );
  }

  const user = findUserByEmail(parsed.data.email);
  if (!user || user.password !== parsed.data.password) {
    return NextResponse.json<ApiErrorBody>(
      { message: "Email or password is incorrect" },
      { status: 401 },
    );
  }

  const sessionUser = toSessionUser(user);
  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: encodeSession(sessionUser),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
