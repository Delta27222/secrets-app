"use client"

import React from "react"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { apiClient, type ApiClient } from "@/lib/api"
import { buildSignInUrl } from "@/lib/auth-session-config"
import type { Session } from "next-auth"

// Creamos un contexto para el API client
const ApiContext = React.createContext<{
  client: ApiClient
  isReady: boolean
}>({
  client: apiClient,
  isReady: false,
})

// Hook personalizado para usar el API client
export const useApi = () => {
  const context = React.useContext(ApiContext)
  if (!context.isReady) {
    // console.warn("API client no está listo. El token podría no estar configurado.")
  }

  // console.info("API client listo")
  return context.client
}

// Hook para verificar si el API client está listo
export const useApiReady = () => React.useContext(ApiContext).isReady

/**
 * Limpia almacenamiento del navegador cuando la sesión expira.
 * Preserva sessionStorage para flags de redirección (tek-session-expired).
 */
function clearBrowserData() {
  localStorage.clear()
}

// Proveedor que configura el API client con el token de sesión
export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isReady, setIsReady] = React.useState<boolean>(false)
  const wasAuthenticated = React.useRef(false)

  // Actualizamos el token cuando cambia la sesión
  React.useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticated.current = true
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken as string, (session as Session & { tokenType?: string }).tokenType)
        setIsReady(true)
      } else {
        apiClient.setToken(undefined)
        setIsReady(false)
      }
    } else if (status === "unauthenticated") {
      apiClient.setToken(undefined)
      setIsReady(false)

      // Si antes estaba autenticado y ahora no → sesión expiró
      // Marcar en sessionStorage para que signin page muestre mensaje,
      // luego limpiar datos y hacer signOut.
      if (wasAuthenticated.current) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[NextAuth:client] Sesión expirada — signOut y limpieza de storage")
        }
        wasAuthenticated.current = false
        clearBrowserData()
        try { sessionStorage.setItem("tek-session-expired", "1") } catch {}
        signOut({
          callbackUrl: buildSignInUrl({
            callbackUrl: pathname,
            sessionExpired: true,
          }),
        })
      }
    }
    // No establecemos isReady en true durante "loading" para evitar llamadas sin token
  }, [session, status])

  return <ApiContext.Provider value={{ client: apiClient, isReady }}>{children}</ApiContext.Provider>
}

