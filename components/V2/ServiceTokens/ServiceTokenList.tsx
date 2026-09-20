"use client"

import React from "react"
import { useServiceTokens } from "@/hooks/useServiceTokens"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceTokenRevokeDialog } from "./ServiceTokenRevokeDialog"
import { ServiceTokenDetailDialog } from "./ServiceTokenDetailDialog"
import { ServiceTokenRotatedDialog } from "./ServiceTokenRotatedDialog"
import { Trash2, RotateCw, Eye, Lock } from "lucide-react"
import { useProjectEnvironments } from "@/hooks"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ServiceToken } from "@/lib/api"
import { cn } from "@/lib/utils"
import { getScopeRisk, getScopeRiskBadgeClass } from "./service-token-scopes"

function isTokenExpired(token: ServiceToken): boolean {
  if (token.status === "expired") return true
  if (!token.expiresAt) return false
  return new Date(token.expiresAt).getTime() < Date.now()
}

export function ServiceTokenList({ projectId }: { projectId: string }) {
  const { tokens, loading, deleteToken, rotateToken } = useServiceTokens()
  const { environments } = useProjectEnvironments()
  const { toast } = useToast()
  const [revokeTokenId, setRevokeTokenId] = React.useState<string | null>(null)
  const [selectedToken, setSelectedToken] = React.useState<ServiceToken | null>(null)
  const [rotatedToken, setRotatedToken] = React.useState<{ tokenId: string; secret: string } | null>(null)
  const [deletingTokenId, setDeletingTokenId] = React.useState<string | null>(null)

  const emptyStateClass =
    "flex min-h-[420px] w-full flex-col items-center justify-center rounded-lg px-6 py-12 text-center"

  React.useEffect(() => {
    if (loading) {
      toast({
        title: "Cargando tokens...",
        description: "Obteniendo lista de tokens",
        duration: 0
      })
    }
  }, [loading, toast])

  if (loading) {
    return (
      <div className={emptyStateClass}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
        <p className="text-sm text-muted-foreground">Cargando tokens...</p>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className={emptyStateClass}>
        <p className="text-sm text-muted-foreground mb-1">
          No hay tokens creados aún
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Crea uno nuevo para comenzar a usar la API
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Permisos</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Creado</th>
                <th className="px-4 py-3 text-left font-semibold">Expira</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tokens.map((token, index) => {
                const expired = isTokenExpired(token)
                return (
                <tr
                  key={index}
                  className={cn(
                    "transition-colors",
                    expired
                      ? "bg-red-50 hover:bg-red-100/70"
                      : "hover:bg-slate-50",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{token.name}</div>
                    {token.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {token.description.substring(0, 40)}
                        {token.description.length > 40 ? "..." : ""}
                      </p>
                    )}
                    {(() => {
                      if (token.environmentId) {
                        const env = (environments || []).find((e) => e._id === token.environmentId)
                        return env ? (
                          <Badge variant="outline" className="text-[10px] mt-1 border-amber-300 bg-amber-50 text-amber-700">
                            <Lock className="w-3 h-3 mr-1" />
                            {env.name}
                          </Badge>
                        ) : null
                      }
                      return (
                        <Badge variant="outline" className="text-[10px] mt-1 border-green-300 bg-green-50 text-green-700">
                          <Lock className="w-3 h-3 mr-1" />
                          Todos los ambientes
                        </Badge>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {token.scopes.slice(0, 2).map((scope: string) => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className={cn("text-xs", getScopeRiskBadgeClass(getScopeRisk(scope)))}
                        >
                          {scope}
                        </Badge>
                      ))}
                      {token.scopes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{token.scopes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        expired
                          ? "destructive"
                          : token.status === "active"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {expired ? "expirado" : token.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(token.createdAt), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-xs",
                      expired
                        ? "font-medium text-red-700"
                        : "text-muted-foreground",
                    )}
                  >
                    {token.expiresAt
                      ? format(new Date(token.expiresAt), "dd MMM yyyy", { locale: es })
                      : "—"}
                    {expired ? (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wide text-red-600">
                        Vencido
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedToken(token)}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            toast({
                              title: "Rotando token...",
                              description: "Generando nuevo token",
                              duration: 0
                            })
                            const result = await rotateToken(token.tokenId, projectId)
                            toast({
                              title: "Token rotado exitosamente",
                              description: "El nuevo token está listo",
                              variant: "default"
                            })
                            setRotatedToken({
                              tokenId: result.new_token_id,
                              secret: result.new_token_secret
                            })
                          } catch (err) {
                            toast({
                              title: "Error al rotar token",
                              description: err instanceof Error ? err.message : "Error desconocido",
                              variant: "destructive"
                            })
                            console.error("Error rotating token:", err)
                          }
                        }}
                        disabled={token.status !== "active" || expired}
                        title="Rotar token"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevokeTokenId(token.tokenId)}
                        disabled={token.status === "revoked"}
                        title="Revocar token"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceTokenDetailDialog
        token={selectedToken}
        open={!!selectedToken}
        onOpenChange={(open) => {
          if (!open) setSelectedToken(null)
        }}
      />

      <ServiceTokenRevokeDialog
        tokenId={revokeTokenId}
        onClose={() => setRevokeTokenId(null)}
        onConfirm={async () => {
          if (revokeTokenId) {
            try {
              setDeletingTokenId(revokeTokenId)
              toast({
                title: "Eliminando token...",
                description: "Revocando token",
                duration: 0
              })
              await deleteToken(revokeTokenId, projectId)
              toast({
                title: "Token eliminado",
                description: "Token revocado exitosamente",
                variant: "default"
              })
              setRevokeTokenId(null)
            } catch (err) {
              toast({
                title: "Error al eliminar token",
                description: err instanceof Error ? err.message : "Error desconocido",
                variant: "destructive"
              })
            } finally {
              setDeletingTokenId(null)
            }
          }
        }}
      />

      <ServiceTokenRotatedDialog
        open={!!rotatedToken}
        tokenId={rotatedToken?.tokenId}
        tokenSecret={rotatedToken?.secret}
        onOpenChange={(open) => {
          if (!open) setRotatedToken(null)
        }}
      />
    </div>
  )
}
