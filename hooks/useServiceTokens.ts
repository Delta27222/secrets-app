"use client"

import { useContext } from "react"
import { ServiceTokensContext } from "@/context/ServiceTokensContext"

export function useServiceTokens() {
  const context = useContext(ServiceTokensContext)
  if (!context) {
    throw new Error("useServiceTokens must be used within ServiceTokensProvider")
  }
  return context
}
