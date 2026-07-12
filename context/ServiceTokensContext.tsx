"use client"

import React, { createContext, useState, useCallback } from "react"
import { useApi } from "@/components/api-provider"
import type {
  ServiceToken,
  ServiceTokenCreateResponse,
  ServiceTokenRotateResponse,
  ServiceTokenUsage,
} from "@/lib/api"

export type TServiceTokensContext = {
  tokens: ServiceToken[]
  loading: boolean
  error: string | null
  selectedToken: ServiceToken | null

  createToken: (projectId: string, data: {
    name: string
    description?: string
    scopes: string[]
    expiresInDays?: number
    environmentId?: string
  }) => Promise<ServiceTokenCreateResponse>

  listTokens: (projectId: string) => Promise<void>
  getToken: (tokenId: string, projectId: string) => Promise<void>
  deleteToken: (tokenId: string, projectId: string, reason?: string) => Promise<void>
  rotateToken: (tokenId: string, projectId: string) => Promise<ServiceTokenRotateResponse>
  getTokenUsage: (tokenId: string, projectId: string) => Promise<ServiceTokenUsage>
  setSelectedToken: (token: ServiceToken | null) => void
  clearError: () => void
}

const defaultContext: TServiceTokensContext = {
  tokens: [],
  loading: false,
  error: null,
  selectedToken: null,
  createToken: async () => { throw new Error("Not initialized") },
  listTokens: async () => {},
  getToken: async () => {},
  deleteToken: async () => {},
  rotateToken: async () => ({
    status: "",
    new_token_id: "",
    new_token_secret: "",
    warning: "",
  }),
  getTokenUsage: async () => ({ requestCount: 0, requestsToday: 0, requestsThisHour: 0 }),
  setSelectedToken: () => {},
  clearError: () => {}
}

export const ServiceTokensContext = createContext<TServiceTokensContext>(defaultContext)

export function ServiceTokensProvider({ children }: { children: React.ReactNode }) {
  const api = useApi()
  const [tokens, setTokens] = useState<ServiceToken[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<ServiceToken | null>(null)

  const createToken = useCallback(
    async (projectId: string, data: {
      name: string
      description?: string
      scopes: string[]
      expiresInDays?: number
      environmentId?: string
    }) => {
      setError(null)
      try {
        const result = await api.createServiceToken(projectId, data)
        const { tokenSecret: _secret, warning: _warning, ...tokenWithoutSecret } = result
        setTokens((prev) => [tokenWithoutSecret, ...prev])
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error creating token"
        setError(message)
        throw err
      }
    },
    [api]
  )

  const listTokens = useCallback(
    async (projectId: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.listServiceTokens(projectId)
        setTokens(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error listing tokens"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const getToken = useCallback(
    async (tokenId: string, projectId: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getServiceToken(tokenId, projectId)
        setSelectedToken(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error getting token"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const deleteToken = useCallback(
    async (tokenId: string, projectId: string, reason?: string) => {
      setLoading(true)
      setError(null)
      try {
        await api.deleteServiceToken(tokenId, projectId, reason)
        setTokens(prev => prev.filter(t => t.tokenId !== tokenId))
        if (selectedToken?.tokenId === tokenId) {
          setSelectedToken(null)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error deleting token"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api, selectedToken]
  )

  const rotateToken = useCallback(
    async (tokenId: string, projectId: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.rotateServiceToken(tokenId, projectId)
        // Refrescar lista después de rotación
        await listTokens(projectId)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error rotating token"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api, listTokens]
  )

  const getTokenUsage = useCallback(
    async (tokenId: string, projectId: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getServiceTokenUsage(tokenId, projectId)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error getting token usage"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: TServiceTokensContext = {
    tokens,
    loading,
    error,
    selectedToken,
    createToken,
    listTokens,
    getToken,
    deleteToken,
    rotateToken,
    getTokenUsage,
    setSelectedToken,
    clearError
  }

  return (
    <ServiceTokensContext.Provider value={value}>
      {children}
    </ServiceTokensContext.Provider>
  )
}
