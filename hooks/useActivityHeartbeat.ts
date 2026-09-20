"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { HEARTBEAT_INTERVAL_MS, ACTIVITY_DEBOUNCE_MS } from "@/lib/auth-session-config"

/**
 * Hook que detecta actividad del usuario y mantiene la sesión viva.
 *
 * Escucha eventos: mousemove, click, keydown, scroll
 * Cuando detecta actividad:
 * 1. Renueva la sesión de NextAuth (triggerea jwt callback con sessionStartedAt actualizado)
 * 2. Esto extiende la expiración de la sesión continuamente
 */
export function useActivityHeartbeat() {
  const { data: session, update: updateSession } = useSession()
  const lastHeartbeatRef = React.useRef<number>(Date.now())
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const refreshSession = React.useCallback(async () => {
    if (!session?.user) return

    const now = Date.now()
    const timeSinceLastHeartbeat = now - lastHeartbeatRef.current

    // Solo renovar si pasó suficiente tiempo (evita spam de requests)
    if (timeSinceLastHeartbeat < HEARTBEAT_INTERVAL_MS) {
      return
    }

    lastHeartbeatRef.current = now

    try {
      // Renovar sesión: fuerza un refresh del JWT que extiende la expiración
      await updateSession()
    } catch (error) {
      console.error("Session refresh error:", error)
    }
  }, [session?.user, updateSession])

  React.useEffect(() => {
    if (!session?.user) return

    const handleActivity = () => {
      // Debounce: agrupa eventos cercanos en el tiempo
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        refreshSession()
      }, ACTIVITY_DEBOUNCE_MS)
    }

    // Listeners de actividad
    document.addEventListener("mousemove", handleActivity)
    document.addEventListener("click", handleActivity)
    document.addEventListener("keydown", handleActivity)
    document.addEventListener("scroll", handleActivity)

    return () => {
      document.removeEventListener("mousemove", handleActivity)
      document.removeEventListener("click", handleActivity)
      document.removeEventListener("keydown", handleActivity)
      document.removeEventListener("scroll", handleActivity)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [session?.user, refreshSession])
}
