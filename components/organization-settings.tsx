"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useApi } from "@/components/api-provider"
import type { Organization } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Settings, Trash2 } from "lucide-react"
import { useNotify } from "@/hooks"

// Modificar la interfaz para incluir el rol del usuario
interface OrganizationSettingsProps {
  organization: Organization
  onOrganizationUpdated: () => void
  userRole: string // Añadir el rol del usuario
}

export function OrganizationSettings({ organization, onOrganizationUpdated, userRole }: OrganizationSettingsProps) {
  const router = useRouter()
  const api = useApi()
  const notify = useNotify()
  const [editDialogOpen, setEditDialogOpen] = React.useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState({
    name: organization.name,
    slug: organization.slug, // Usando el ID como slug inicial
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) return

    try {
      setIsSubmitting(true)
      await api.updateOrganization(organization._id, {
        name: formData.name,
        slug: formData.slug,
      })
      setEditDialogOpen(false)
      onOrganizationUpdated()
      notify("Organización actualizada", "success");
    } catch (err) {
      console.error("Error updating organization:", err)
      notify("No se pudo actualizar la organización. Por favor, intenta de nuevo más tarde.", "error");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOrganization = async () => {
    try {
      setIsDeleting(true)
      await api.deleteOrganization(organization._id)
      setDeleteDialogOpen(false)
      notify("Organización eliminada correctamente.", "success");
      // Asegurar la redirección a la página principal
      setTimeout(() => {
        router.push("/")
      }, 500) // Pequeño retraso para asegurar que el toast se muestre
    } catch (err) {
      console.error("Error deleting organization:", err)
      notify("No se pudo eliminar la organización. Por favor, intenta de nuevo más tarde.", "error");
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Verificar si el usuario es admin o owner para mostrar el botón de configuración
  const canEdit = userRole === "owner" || userRole === "admin" || userRole === "ADMIN"
  // Verificar si el usuario es owner para mostrar el botón de eliminar
  const canDelete = userRole === "owner"

  if (!canEdit && !canDelete) {
    return null // No mostrar nada si el usuario no tiene permisos
  }

  return (
    <div className="flex space-x-2">
      {canEdit && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Organización</DialogTitle>
              <DialogDescription>
                Actualiza la información de tu organización. El slug se utiliza en las URLs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateOrganization}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre de la organización"
                    required
                  />
                </div>
              
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {canDelete && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta organización?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados a esta
                organización, incluyendo proyectos, secretos y membresías.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrganization}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? "Eliminando..." : "Eliminar Organización"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
