"use client"

import React from "react"
import { useApi } from "@/components/api-provider"
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
import { Plus, Copy, Check, Trash2, KeyRound } from "lucide-react"
import type { SystemToken } from "@/lib/api"
import { SYSTEM_TOKEN_SCOPES } from "./system-token-scopes"

const EXPIRATION_OPTIONS = [90, 180, 365, 730] as const

export function SystemTokensManager() {
  const api = useApi()
  const [tokens, setTokens] = React.useState<SystemToken[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showCreate, setShowCreate] = React.useState(false)

  const loadTokens = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.listSystemTokens()
      setTokens(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error listando tokens")
    } finally {
      setLoading(false)
    }
  }, [api])

  React.useEffect(() => {
    loadTokens()
  }, [loadTokens])

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("¿Revocar este token de sistema? Esta acción es inmediata.")) return
    try {
      await api.deleteSystemToken(tokenId)
      setTokens((prev) => prev.filter((t) => t.tokenId !== tokenId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error revocando token")
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Tokens de Servicio (Sistema)</h2>
          <p className="text-sm text-muted-foreground">
            Tokens globales para automatización (ej: rotación de llaves).
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Crear Token
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No hay tokens de sistema todavía.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {tokens.map((token) => (
            <div key={token.tokenId} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{token.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {token.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {token.scopes.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Expira: {new Date(token.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(token.tokenId)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <SystemTokenCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={loadTokens}
      />
    </div>
  )
}

function SystemTokenCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const api = useApi()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [secret, setSecret] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    scopes: ["keys:rotate"] as string[],
    expires_in_days: 365,
  })

  const reset = () => {
    setForm({ name: "", description: "", scopes: ["keys:rotate"], expires_in_days: 365 })
    setError(null)
    setCopied(false)
  }

  const toggleScope = (name: string) => {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(name)
        ? f.scopes.filter((s) => s !== name)
        : [...f.scopes, name],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await api.createSystemToken(form)
      setSecret(result.tokenSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando token")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!secret) {
      onOpenChange(false)
      reset()
    }
  }

  const handleDone = () => {
    setSecret(null)
    onOpenChange(false)
    reset()
    onCreated()
  }

  const handleCopy = async () => {
    if (!secret) return
    await navigator.clipboard.writeText(secret)
    setCopied(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{secret ? "✅ Token Creado" : "Crear Token de Sistema"}</DialogTitle>
          <DialogDescription>
            {secret
              ? "Guárdalo en un lugar seguro. No podrás verlo nuevamente."
              : "Token global para automatización (rotación de llaves, etc)."}
          </DialogDescription>
        </DialogHeader>

        {secret ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded border break-all font-mono text-sm">
              {secret}
            </div>
            {!copied ? (
              <Button onClick={handleCopy} variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copiar al portapapeles
              </Button>
            ) : (
              <>
                <p className="flex items-center justify-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  Token copiado
                </p>
                <Button onClick={handleDone} className="w-full">
                  Listo
                </Button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Nombre</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ej: lambda-rotation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descripción</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Permisos (Scopes)</label>
              <div className="grid grid-cols-2 gap-2">
                {SYSTEM_TOKEN_SCOPES.map((scope) => (
                  <label
                    key={scope.name}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.scopes.includes(scope.name)}
                      onChange={() => toggleScope(scope.name)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-mono">{scope.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Expira en</label>
              <Select
                value={String(form.expires_in_days)}
                onValueChange={(v) => setForm({ ...form, expires_in_days: Number.parseInt(v, 10) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} días
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.name || form.scopes.length === 0}
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
