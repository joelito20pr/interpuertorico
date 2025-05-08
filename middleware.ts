import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_user_id")

  // If accessing dashboard routes without auth cookie, redirect to login
  if (request.nextUrl.pathname.startsWith("/dashboard") && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing login with auth cookie, redirect to dashboard
  if (request.nextUrl.pathname === "/login" && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
