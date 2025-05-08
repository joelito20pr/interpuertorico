import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log(`Middleware processing: ${request.method} ${request.nextUrl.pathname}`)

  const authCookie = request.cookies.get("auth_user_id")
  const path = request.nextUrl.pathname

  // Allow all API routes without restrictions
  if (path.startsWith("/api/")) {
    console.log(`Allowing API access: ${path}`)
    return NextResponse.next()
  }

  // Explicitly allow these critical endpoints
  if (path === "/api/events/register" || path === "/api/events/register-new" || path.startsWith("/api/debug/")) {
    console.log(`Explicitly allowing critical endpoint: ${path}`)
    return NextResponse.next()
  }

  // Allow access to public event pages
  if (path.startsWith("/eventos/")) {
    console.log(`Allowing public event page: ${path}`)
    return NextResponse.next()
  }

  // Permitir acceso a la página principal y a la página de auspiciadores sin autenticación
  if (path === "/" || path.startsWith("/auspiciadores") || path.startsWith("/patrocinadores")) {
    console.log(`Allowing public page: ${path}`)
    return NextResponse.next()
  }

  // Si accede a rutas del dashboard sin cookie de autenticación, redirigir a login
  if (path.startsWith("/dashboard") && !authCookie) {
    console.log(`Redirecting to login: ${path}`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si accede a login con cookie de autenticación, redirigir a dashboard
  if (path === "/login" && authCookie) {
    console.log(`Redirecting to dashboard: ${path}`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  console.log(`Default allow: ${path}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
}
