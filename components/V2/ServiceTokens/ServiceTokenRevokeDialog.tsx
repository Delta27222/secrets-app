"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ServiceTokenRevokeDialog({
  tokenId,
  onClose,
  onConfirm,
}: {
  tokenId: string | null
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [isRevoking, setIsRevoking] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open && !isRevoking) {
      onClose()
    }
  }

  const handleConfirm = async () => {
    setIsRevoking(true)
    try {
      await onConfirm()
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <AlertDialog open={!!tokenId} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de que quieres revocar este token de servicio?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Cualquier aplicación o script que
            use este token perderá el acceso de inmediato.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRevoking}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isRevoking}
            className="bg-red-500 hover:bg-red-600"
          >
            {isRevoking ? "Revocando..." : "Revocar Token"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
