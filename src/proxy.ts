import { NextResponse, type NextRequest } from "next/server";
import { decodeSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/constants";

const ROLE_PREFIXES = [
  { prefix: "/parent", role: "parent" },
  { prefix: "/sitter", role: "sitter" },
  { prefix: "/admin", role: "admin" },
] as const;

export default function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const session = decodeSession(request.cookies.get("bs_session")?.value);

  if (!session) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  const matched = ROLE_PREFIXES.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (matched && matched.role !== session.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/parent/:path*",
    "/sitter/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
