"use client"

import React from "react"
import { useApi } from "@/components/api-provider"
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
import { Plus, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useNotify } from "@/hooks"

interface CreateProjectFormProps {
  organizationId: string
  onProjectCreated: () => void
}

export function CreateProjectForm({ organizationId, onProjectCreated }: CreateProjectFormProps) {
  const api = useApi()
  const notify = useNotify();
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    tags: {
      folder: "",
      team: "",
    } as Record<string, string>,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Generar automáticamente el slug a partir del nombre
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleTagChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: {
        ...prev.tags,
        [key]: value,
      },
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
      const newTags = { ...prev.tags }
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
      const newTags = { ...prev.tags }
      const value = newTags[oldKey]
      delete newTags[oldKey]
      newTags[newKey] = value
      return {
        ...prev,
        tags: newTags,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) return

    try {
      setIsSubmitting(true)

      // Filtrar tags vacíos
      const filteredTags = Object.fromEntries(
        Object.entries(formData.tags).filter(([key, value]) => key.trim() !== "" && value.trim() !== ""),
      )

      await api.createProject({
        name: formData.name,
        slug: formData.slug,
        organization_id: organizationId,
        tags: filteredTags,
      })
      setDialogOpen(false)
      setFormData({
        name: "",
        slug: "",
        tags: {
          folder: "",
          team: "",
        },
      })
      onProjectCreated()
      notify("Proyecto creado correctamente.", "success");
    } catch (err) {
      console.error("Error creating project:", err)
      notify("Error al crear el proyecto. Por favor, intenta de nuevo.", "error");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Crea un nuevo proyecto en esta organización. El slug se utilizará en las URLs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="slug-del-proyecto"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El slug debe ser único y solo puede contener letras, números y guiones.
                </p>
              </div>
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
              {isSubmitting ? "Creando..." : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
