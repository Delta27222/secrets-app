"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Edit, Trash2, Lock } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useApi } from "@/components/api-provider"
import type { Secret } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface SecretsListProps {
  secrets: Secret[]
  onUpdate: () => void
  organizationId?: string
}

export function SecretsList({ secrets, onUpdate, organizationId }: SecretsListProps) {
  const api = useApi()
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})

  const toggleVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSecret(id)
      onUpdate()
    } catch (error) {
      console.error("Error al eliminar el secreto:", error)
    }
  }

  if (!secrets || secrets.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No se encontraron secretos</h3>
        <p className="text-muted-foreground mb-6">
          Aún no hay secretos en esta organización. Crea tu primer secreto para comenzar.
        </p>
        {organizationId && (
          <Button asChild>
            <Link href={`/organizations/${organizationId}/secretos/nuevo`}>Añadir Primer Secreto</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {secrets.map((secret) => (
        <Card key={secret._id}>
          <CardHeader>
            <CardTitle>{secret.name}</CardTitle>
            <CardDescription>{secret.description || "Sin descripción"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex-1 font-mono bg-muted p-2 rounded-md overflow-hidden">
                {visibleSecrets[secret._id] ? (
                  <span className="break-all">{secret.value}</span>
                ) : (
                  <span>••••••••••••••••</span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleVisibility(secret._id)}>
                {visibleSecrets[secret._id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-xs text-muted-foreground">
              Actualizado {formatDistanceToNow(new Date(secret.updatedAt), { addSuffix: true, locale: es })}
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/secretos/${secret._id}/editar`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente tu secreto y lo eliminará de
                      nuestros servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(secret._id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

