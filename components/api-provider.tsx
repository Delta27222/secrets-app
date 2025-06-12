"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { apiClient, type ApiClient } from "@/lib/api"
import type { Session } from "next-auth"

// Creamos un contexto para el API client
const ApiContext = createContext<{
  client: ApiClient
  isReady: boolean
}>({
  client: apiClient,
  isReady: false,
})

// Hook personalizado para usar el API client
export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context.isReady) {
    // console.warn("API client no está listo. El token podría no estar configurado.")
  }

  // console.info("API client listo")
  return context.client
}

// Hook para verificar si el API client está listo
export const useApiReady = () => useContext(ApiContext).isReady

// Proveedor que configura el API client con el token de sesión
export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isReady, setIsReady] = useState(false)

  // Actualizamos el token cuando cambia la sesión
  useEffect(() => {
    console.log("Estado de sesión:", status)
    console.log("Token de sesión:", session?.accessToken)

    if (status === "authenticated") {
      if (session?.accessToken) {
        console.log("Configurando token:", session.accessToken)
        apiClient.setToken(session.accessToken as string, (session as Session & { tokenType?: string }).tokenType)
        setIsReady(true)
      } else {
        console.warn("Sesión autenticada pero sin token")
        apiClient.setToken(undefined)
        setIsReady(false)
      }
    } else if (status === "unauthenticated") {
      console.log("Usuario no autenticado, limpiando token")
      apiClient.setToken(undefined)
      setIsReady(false)
    }
    // No establecemos isReady en true durante "loading" para evitar llamadas sin token
  }, [session, status])

  return <ApiContext.Provider value={{ client: apiClient, isReady }}>{children}</ApiContext.Provider>
}

