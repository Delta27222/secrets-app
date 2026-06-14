"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { buildSignInUrl } from "@/lib/auth-session-config"

/**
 * Redirige al login cuando no hay sesión. La navegación va en useEffect
 * para no llamar router durante el render (error de React).
 */
export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const wasAuthenticated = useRef(false)

  useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticated.current = true
    }
  }, [status])

  useEffect(() => {
    if (status !== "unauthenticated") return
    router.replace(
      buildSignInUrl({
        callbackUrl: pathname,
        sessionExpired: wasAuthenticated.current,
      }),
    )
  }, [status, router, pathname])

  return {
    session,
    status,
    isLoading: status === "loading",
    isRedirecting: status === "unauthenticated",
    isAuthenticated: status === "authenticated",
  }
}
