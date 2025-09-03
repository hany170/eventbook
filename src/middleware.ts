import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Protect validator routes
    if (path.startsWith("/validator") && token?.role !== "VALIDATOR" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Protect wallet and checkout routes
    if ((path.startsWith("/wallet") || path.startsWith("/checkout")) && !token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/validator/:path*", "/wallet/:path*", "/checkout/:path*"]
};
