"use client"

import React from "react"
import { useServiceTokens } from "@/hooks/useServiceTokens"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Check, CheckSquare2, Lock } from "lucide-react"
import { useProjectEnvironments } from "@/hooks"
import {
  getScopeRiskLabel,
  getScopeRiskPillClass,
  SERVICE_TOKEN_SCOPES,
} from "./service-token-scopes"

const EXPIRATION_OPTIONS = [10, 30, 45, 75, 90] as const
const AVAILABLE_SCOPES = SERVICE_TOKEN_SCOPES

export function ServiceTokenCreate({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const { createToken } = useServiceTokens()
  const { environments } = useProjectEnvironments()
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null | undefined>(undefined)
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null)
  const [hasCopied, setHasCopied] = React.useState<boolean>(false)

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    scopes: [] as string[],
    expiresInDays: 90,
    environmentId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { environmentId, ...rest } = formData
      const payload = environmentId ? { ...rest, environmentId } : rest
      const result = await createToken(projectId, payload)
      setGeneratedToken(result.tokenSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error creando token"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!generatedToken) {
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      scopes: [],
      expiresInDays: 90,
      environmentId: "",
    })
    setError(null)
    setHasCopied(false)
  }

  const handleSuccess = () => {
    setGeneratedToken(null)
    onOpenChange(false)
    resetForm()
    onSuccess()
  }

  const handleCopy = async () => {
    if (!generatedToken) return
    await navigator.clipboard.writeText(generatedToken)
    setHasCopied(true)
  }

  const toggleSelectAll = () => {
    if (formData.scopes.length === AVAILABLE_SCOPES.length) {
      setFormData({ ...formData, scopes: [] })
    } else {
      setFormData({ ...formData, scopes: AVAILABLE_SCOPES.map((s) => s.name) })
    }
  }

  const toggleScope = (scopeName: string) => {
    if (formData.scopes.includes(scopeName)) {
      setFormData({
        ...formData,
        scopes: formData.scopes.filter((s) => s !== scopeName),
      })
    } else {
      setFormData({
        ...formData,
        scopes: [...formData.scopes, scopeName],
      })
    }
  }

  const scopesByCategory = AVAILABLE_SCOPES.reduce(
    (acc, scope) => {
      if (!acc[scope.category]) acc[scope.category] = []
      acc[scope.category].push(scope)
      return acc
    },
    {} as Record<string, (typeof SERVICE_TOKEN_SCOPES)[number][]>,
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {generatedToken ? "✅ Token Creado" : "Crear Token de Servicio"}
          </DialogTitle>
          <DialogDescription>
            {generatedToken
              ? "Guarda este token en un lugar seguro. No podrás verlo nuevamente."
              : "Configura permisos y duración del token"}
          </DialogDescription>
        </DialogHeader>

        {generatedToken ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded border border-gray-200 break-all font-mono text-sm">
              {generatedToken}
            </div>

            {!hasCopied ? (
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar al portapapeles
              </Button>
            ) : (
              <>
                <p className="flex items-center justify-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  Token copiado al portapapeles
                </p>
                <Button onClick={handleSuccess} className="w-full">
                  Listo, volver a tokens
                </Button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Nombre del Token</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ej: GitHub Actions Deploy"
                required
                className="h-10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Para qué sirve este token"
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Ambiente restringido
              </label>
              <Select
                value={formData.environmentId || "__all__"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    environmentId: value === "__all__" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecciona un ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos los ambientes</SelectItem>
                  {(environments || []).map((env) => (
                    <SelectItem key={env._id} value={env._id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Si seleccionas un ambiente, el token solo podrá acceder a los secretos de ese ambiente.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold">Permisos (Scopes)</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-8 text-xs"
                >
                  <CheckSquare2 className="w-3.5 h-3.5 mr-1.5" />
                  {formData.scopes.length === AVAILABLE_SCOPES.length ? "Deseleccionar" : "Seleccionar"} todo
                </Button>
              </div>

              <div className="space-y-4 max-h-48 overflow-y-auto">
                {Object.entries(scopesByCategory).map(([category, scopes]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pl-0">
                      {scopes.map((scope) => (
                        <label
                          key={scope.name}
                          className="flex items-center gap-2.5 p-2.5 rounded-md hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.scopes.includes(scope.name)}
                            onChange={() => toggleScope(scope.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{scope.name}</span>
                            <span
                              className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                                scope.risk === "high"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {scope.risk === "high" ? "Alto riesgo" : "Bajo riesgo"}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="expires-in-days" className="block text-sm font-semibold mb-2">
                Expira en
              </label>
              <Select
                value={String(formData.expiresInDays)}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    expiresInDays: Number.parseInt(value, 10),
                  })
                }
              >
                <SelectTrigger id="expires-in-days" className="h-10">
                  <SelectValue placeholder="Selecciona un plazo" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} días
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || formData.scopes.length === 0}
                className="flex-1"
              >
                {loading ? "Creando..." : "Crear Token"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
