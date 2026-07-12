"use client"

import React from "react"
import { ServiceToken } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getScopeRisk, getScopeRiskBadgeClass } from "./service-token-scopes"
import { useProjectEnvironments } from "@/hooks"

export function ServiceTokenDetailDialog({
  token,
  open,
  onOpenChange,
}: {
  token: ServiceToken | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { environments } = useProjectEnvironments()

  if (!token) return null

  const restrictedEnv = token.environmentId
    ? (environments || []).find((e) => e._id === token.environmentId)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{token.name}</DialogTitle>
          <DialogDescription>
            {token.description || "Sin descripción"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Estado</h3>
            <div className="flex items-center gap-3">
              <Badge
                variant={token.status === "active" ? "default" : "secondary"}
              >
                {token.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {token.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          {/* ID del Token */}
          <div>
            <h3 className="text-sm font-semibold mb-2">ID del Token</h3>
            <div className="bg-slate-50 p-3 rounded-md font-mono text-xs break-all">
              {token.tokenId}
            </div>
          </div>

          {/* Ambiente restringido */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Ambiente</h3>
            {restrictedEnv ? (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                {restrictedEnv.name}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Todos los ambientes del proyecto
              </span>
            )}
          </div>

          {/* Permisos */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Permisos</h3>
            <div className="flex flex-wrap gap-2">
              {token.scopes.map((scope) => {
                const risk = getScopeRisk(scope)
                return (
                  <Badge
                    key={scope}
                    variant="outline"
                    className={getScopeRiskBadgeClass(risk)}
                  >
                    {scope}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Creado</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(token.createdAt), "dd MMMM yyyy, HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Expira</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(token.expiresAt), "dd MMMM yyyy, HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          </div>

          {/* Uso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Solicitudes Totales</h3>
              <p className="text-sm text-muted-foreground">
                {token.requestCount || 0}
              </p>
            </div>
            {token.lastUsedAt && (
              <div>
                <h3 className="text-sm font-semibold mb-1">Último Uso</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(token.lastUsedAt), "dd MMMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
