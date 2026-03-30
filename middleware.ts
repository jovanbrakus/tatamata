import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPages = [
  "/vezba",
  "/zadaci",
  "/simulacija",
  "/znanje",
  "/profil",
  "/analitika",
  "/admin",
  "/vezbe",
];

const protectedApi = [
  "/api/practice",
  "/api/simulation",
  "/api/user",
  "/api/ai",
  "/api/admin",
  "/api/bookmarks",
  "/api/profile",
  "/api/onboarding",
  "/api/analytics",
  "/api/leaderboard/me",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedPage = protectedPages.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isProtectedApi = protectedApi.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!req.auth?.user) {
    if (isProtectedPage) {
      const loginUrl = new URL("/prijava", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, logo.svg, public assets
     * - API auth routes (NextAuth handlers)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.svg|api/auth).*)",
  ],
};
