import { NextResponse, type NextRequest } from "next/server";
import { registerSchema } from "@/schemas/auth";
import { addRegisteredUser, findUserByEmail, toSessionUser } from "@/lib/auth/demo-users";
import { encodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import type { ApiErrorBody, Role } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorBody>({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return NextResponse.json<ApiErrorBody>(
      { message: "Please check the highlighted fields", fieldErrors },
      { status: 400 },
    );
  }

  if (findUserByEmail(parsed.data.email)) {
    return NextResponse.json<ApiErrorBody>(
      { message: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const role: Exclude<Role, "admin"> = parsed.data.role;
  const user = {
    id: `usr_${role}_${Date.now().toString(36)}`,
    email: parsed.data.email,
    password: parsed.data.password,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    role,
    phone: parsed.data.phone,
  };

  addRegisteredUser(user);
  const sessionUser = toSessionUser(user);
  const response = NextResponse.json({ user: sessionUser }, { status: 201 });
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
