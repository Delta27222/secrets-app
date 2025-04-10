"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApi } from "@/components/api-provider"
import type { ProjectDetail } from "@/lib/api"
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
import { toast } from "@/hooks/use-toast"

interface ProjectSettingsProps {
  project: ProjectDetail
  userProjectRole: string | null
  userOrgRole: string | null
  onProjectUpdated: () => void
}

export function ProjectSettings({ project, userProjectRole, userOrgRole, onProjectUpdated }: ProjectSettingsProps) {
  const router = useRouter()
  const api = useApi()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      setIsSubmitting(true)
      await api.updateProject(project._id, {
        name: formData.name,
      })
      setEditDialogOpen(false)
      onProjectUpdated()
      toast({
        title: "Proyecto actualizado",
        description: "La información del proyecto ha sido actualizada correctamente.",
      })
    } catch (err) {
      console.error("Error updating project:", err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true)
      await api.deleteProject(project._id)
      setDeleteDialogOpen(false)
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado correctamente.",
      })
      // Redirigir a la página de la organización
      setTimeout(() => {
        router.push(`/organizations/${project.organization_id}`)
      }, 500)
    } catch (err) {
      console.error("Error deleting project:", err)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Verificar permisos para editar y eliminar
  const isOrgAdmin = userOrgRole === "owner" || userOrgRole === "admin"
  const isProjectAdmin = userProjectRole === "admin"
  const isProjectCollab = userProjectRole === "collab"
  const isOrgOwner = userOrgRole === "owner"

  // Puede editar si es admin del proyecto o admin/owner de la organización
  const canEdit = isProjectAdmin || isOrgAdmin || isProjectCollab
  // Puede eliminar si es admin del proyecto o owner de la organización
  const canDelete = isProjectAdmin || isOrgOwner

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
              <DialogTitle>Editar Proyecto</DialogTitle>
              <DialogDescription>Actualiza la información de tu proyecto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre del proyecto"
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
              <AlertDialogTitle>¿Estás seguro de que quieres eliminar este proyecto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados a este
                proyecto, incluyendo ambientes, secretos y membresías.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? "Eliminando..." : "Eliminar Proyecto"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
