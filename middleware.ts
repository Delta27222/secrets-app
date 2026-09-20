import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * Cookie marcador que indica "usuario tuvo sesión activa".
 * Se setea cuando hay sesión válida y se usa para detectar expiración
 * cuando la session cookie ya fue limpiada por NextAuth.
 */
const HAD_SESSION_COOKIE = "tek-had-session"

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ["/organizations", "/projects", "/sdk-demo"]

  const isProtectedPath = protectedPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`),
  )

  if (isProtectedPath && session) {
    // Sesión válida: marcar cookie para detectar expiración futura
    const response = NextResponse.next()
    response.cookies.set(HAD_SESSION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // Sin maxAge: vive hasta cerrar navegador (session cookie)
    })
    return response
  }

  if (isProtectedPath && !session) {
    const url = new URL(`/auth/signin`, req.url)
    url.searchParams.set("callbackUrl", req.nextUrl.pathname)

    // Detectar si fue expiración: revisar nuestro marcador O la cookie de NextAuth
    const hadSession =
      req.cookies.has(HAD_SESSION_COOKIE) ||
      req.cookies.has("next-auth.session-token") ||
      req.cookies.has("__Secure-next-auth.session-token")

    if (hadSession) {
      url.searchParams.set("expired", "1")
    }

    const response = NextResponse.redirect(url)
    // Limpiar marcador si existía
    if (req.cookies.has(HAD_SESSION_COOKIE)) {
      response.cookies.delete(HAD_SESSION_COOKIE)
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/organizations/:path*", "/projects/:path*", "/sdk-demo/:path*", "/sdk-demo"],
}

