"use client"
import * as React from "react"

import { SessionProvider, useSession } from "next-auth/react"
import { SESSION_REFETCH_INTERVAL_SECONDS } from "@/lib/auth-session-config"
import { ActivityHeartbeatListener } from "./activity-heartbeat-listener"

const isDev = process.env.NODE_ENV === "development"

/** Logs en la consola del navegador (DevTools) al cambiar status o expires. */
function SessionDebugLogger() {
  const { data: session, status } = useSession()

  React.useEffect(() => {
    if (!isDev) return

    const expiresAt = session?.expires
    const secondsLeft =
      expiresAt != null
        ? Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)
        : undefined

    console.log("[NextAuth:client]", {
      status,
      expiresAt,
      secondsUntilExpiry: secondsLeft,
      isExpired: secondsLeft != null ? secondsLeft <= 0 : undefined,
      user: session?.user?.email,
    })
  }, [session, status])

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Sin polling automático: heartbeat por actividad lo reemplaza
      refetchInterval={SESSION_REFETCH_INTERVAL_SECONDS}
      refetchOnWindowFocus={false}
    >
      <SessionDebugLogger />
      <ActivityHeartbeatListener />
      {children}
    </SessionProvider>
  )
}

