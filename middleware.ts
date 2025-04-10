import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ["/organizations", "/projects"]

  const isProtectedPath = protectedPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`),
  )

  if (isProtectedPath && !session) {
    const url = new URL(`/auth/signin`, req.url)
    url.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/secretos/:path*"],
}

