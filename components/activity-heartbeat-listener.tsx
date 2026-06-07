"use client"

import { useActivityHeartbeat } from "@/hooks/useActivityHeartbeat"

/**
 * Cliente-side component que escucha actividad del usuario.
 * Debe estar dentro de SessionProvider para acceder a la sesión.
 */
export function ActivityHeartbeatListener() {
  useActivityHeartbeat()
  return null
}
