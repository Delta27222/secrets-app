"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface ServiceTokenRotatedDialogProps {
  open: boolean
  tokenId?: string
  tokenSecret?: string
  onOpenChange: (open: boolean) => void
}

export function ServiceTokenRotatedDialog({
  open,
  tokenId,
  tokenSecret,
  onOpenChange,
}: ServiceTokenRotatedDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (tokenSecret) {
      await navigator.clipboard.writeText(tokenSecret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Token Rotado Exitosamente</DialogTitle>
          <DialogDescription>
            Tu token ha sido rotado y el token anterior ha sido revocado inmediatamente.
            El nuevo token es válido desde ahora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Nuevo Token ID</p>
            <p className="font-mono text-sm text-blue-800 break-all">{tokenId}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-900 mb-2">Nuevo Token Secret</p>
            <p className="font-mono text-sm text-amber-800 break-all mb-3">
              {tokenSecret}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Token
                </>
              )}
            </Button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-800">
              ⚠️ Guarda este token en un lugar seguro. No podrás verlo nuevamente.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
