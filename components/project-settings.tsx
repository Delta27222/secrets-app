"use client"

import React from "react"
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
import { Settings, Trash2, Plus, X } from "lucide-react"
import { useNotify } from "@/hooks"

interface ProjectSettingsProps {
  project: ProjectDetail
  userProjectRole: string | null
  userOrgRole: string | null
  onProjectUpdated: () => void
}

export function ProjectSettings({ project, userProjectRole, userOrgRole, onProjectUpdated }: ProjectSettingsProps) {
  const router = useRouter()
  const api = useApi()
  const notify = useNotify();
  const [editDialogOpen, setEditDialogOpen] = React.useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState({
    name: project.name,
    tags: {
      folder: project.tags?.folder || "",
      team: project.tags?.team || "",
      ...Object.fromEntries(Object.entries(project.tags || {}).filter(([key]) => key !== "folder" && key !== "team")),
    } as Record<string, string>,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [key]: value,
      } as Record<string, string>,
    }))
  }

  const addCustomTag = () => {
    const newKey = `tag_${Date.now()}`
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [newKey]: "",
      },
    }))
  }

  const removeCustomTag = (key: string) => {
    if (key === "folder" || key === "team") return // No permitir eliminar tags requeridos

    setFormData((prev) => {
      const newTags = { ...prev.tags } as Record<string, string>
      delete newTags[key]
      return {
        ...prev,
        tags: newTags,
      }
    })
  }

  const updateTagKey = (oldKey: string, newKey: string) => {
    if (oldKey === "folder" || oldKey === "team") return // No permitir cambiar keys requeridos
    if (newKey === "folder" || newKey === "team") return // No permitir usar keys reservados

    setFormData((prev) => {
      const newTags = { ...prev.tags } as Record<string, string>
      const value = newTags[oldKey]
      delete newTags[oldKey]
      newTags[newKey] = value
      return {
        ...prev,
        tags: newTags,
      }
    })
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    try {
      setIsSubmitting(true)

      // Filtrar tags vacíos
      const filteredTags = Object.fromEntries(
        Object.entries(formData.tags).filter(([key, value]) => key.trim() !== "" && value.trim() !== ""),
      )

      await api.updateProject(project._id, {
        name: formData.name,
        tags: filteredTags,
      })
      setEditDialogOpen(false)
      onProjectUpdated()
      notify("Proyecto actualizado correctamente.", "success");
    } catch (err) {
      console.error("Error updating project:", err)
      notify("No se pudo actualizar el proyecto. Por favor, intenta de nuevo más tarde.", "error");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true)
      await api.deleteProject(project._id)
      setDeleteDialogOpen(false)
      notify("Proyecto eliminado correctamente.", "success");
      // Redirigir a la página de la organización
      setTimeout(() => {
        router.push(`/organizations/${project.organization_id}`)
      }, 500)
    } catch (err) {
      console.error("Error deleting project:", err)
      notify("No se pudo eliminar el proyecto. Por favor, intenta de nuevo más tarde.", "error");
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Proyecto</DialogTitle>
              <DialogDescription>Actualiza la información y tags de tu proyecto.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProject}>
              <div className="grid gap-6 py-4">
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

                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Tags del Proyecto</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Tag
                    </Button>
                  </div>

                  {/* Tags requeridos */}
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="folder-tag" className="text-sm font-medium">
                          Proyecto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="folder-tag"
                          value={formData.tags.folder}
                          onChange={(e) => handleTagChange("folder", e.target.value)}
                          placeholder="ej. Spotify"
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-tag" className="text-sm font-medium">
                          Equipo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="team-tag"
                          value={formData.tags.team}
                          onChange={(e) => handleTagChange("team", e.target.value)}
                          placeholder="ej. Mobile Flutter"
                        />
                      </div>
                    </div>

                    {/* Tags personalizados */}
                    {Object.entries(formData.tags)
                      .filter(([key]) => key !== "folder" && key !== "team")
                      .map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2 gap-3 items-end">
                          <div>
                            <Label className="text-sm font-medium">Nombre del Tag</Label>
                            <Input
                              value={key}
                              onChange={(e) => updateTagKey(key, e.target.value)}
                              placeholder="Nombre del tag"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={value}
                              onChange={(e) => handleTagChange(key, e.target.value)}
                              placeholder="Valor del tag"
                              className="flex-1"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => removeCustomTag(key)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
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
