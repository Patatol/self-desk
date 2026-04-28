import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPaths = ["/chat", "/notes", "/files", "/search"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some((path) => pathname.startsWith(path));
  if (!needsAuth) return NextResponse.next();

  const session = request.cookies.get("selfdesk_session")?.value;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/notes/:path*", "/files/:path*", "/search/:path*"],
};
