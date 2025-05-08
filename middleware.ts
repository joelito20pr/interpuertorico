import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_user_id")
  const path = request.nextUrl.pathname

  // Permitir acceso a la página principal y a la página de auspiciadores sin autenticación
  if (path === "/" || path.startsWith("/auspiciadores") || path.startsWith("/patrocinadores")) {
    return NextResponse.next()
  }

  // Si accede a rutas del dashboard sin cookie de autenticación, redirigir a login
  if (path.startsWith("/dashboard") && !authCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si accede a login con cookie de autenticación, redirigir a dashboard
  if (path === "/login" && authCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

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
