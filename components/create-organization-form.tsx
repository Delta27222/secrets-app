"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus } from "lucide-react"
import { useNotify } from "@/hooks"

interface CreateOrganizationFormProps {
  onOrganizationCreated: () => void
}

export function CreateOrganizationForm({ onOrganizationCreated }: CreateOrganizationFormProps) {
  const router = useRouter()
  const api = useApi()
  const notify = useNotify();
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) return

    try {
      setIsSubmitting(true)
      const newOrg = await api.createOrganization({
        name: formData.name,
        slug: formData.slug,
      })
      setDialogOpen(false)
      setFormData({ name: "", slug: "" })
      onOrganizationCreated()
      notify("Organización creada correctamente.", "success");

      // Opcional: redirigir a la nueva organización
      setTimeout(() => {
        router.push(`/organizations/${newOrg._id}`)
      }, 500)
    } catch (err) {
      console.error("Error creating organization:", err)
      notify("Error al crear la organización. Por favor, intenta de nuevo.", "error");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Organización
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Organización</DialogTitle>
          <DialogDescription>
            Crea una nueva organización para gestionar proyectos y secretos. El slug se utilizará en las URLs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="slug-de-la-organizacion"
                required
              />
              <p className="text-xs text-muted-foreground">
                El slug debe ser único y solo puede contener letras, números y guiones.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Organización"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
