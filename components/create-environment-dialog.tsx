"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useApi } from "@/components/api-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNotify } from "@/hooks";

type CreateEnvironmentDialogProps = {
  projectId: string;
  onEnvironmentCreated: () => void;
  children?: React.ReactNode;
};

export function CreateEnvironmentDialog({
  projectId,
  onEnvironmentCreated,
  children,
}: CreateEnvironmentDialogProps) {
  const api = useApi();
  const notify = useNotify();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", slug: "" });

  const resetForm = React.useCallback(() => {
    setFormData({ name: "", slug: "" });
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      resetForm();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name") {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    try {
      setIsSubmitting(true);
      await api.createEnvironment({
        project_id: projectId,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        render_server_id: null,
        render_token: null,
        vercel_project_id: null,
        vercel_token: null,
        vercel_target: null,
        secrets: {},
      });
      setOpen(false);
      resetForm();
      onEnvironmentCreated();
      notify("Ambiente creado correctamente.", "success");
    } catch (err) {
      console.error("Error creating environment:", err);
      const raw = err instanceof Error ? err.message : "";
      if (
        raw.includes("401") ||
        raw.toLowerCase().includes("not have permissions") ||
        raw.toLowerCase().includes("permission")
      ) {
        notify(
          "No tienes permiso para crear ambientes en este proyecto (se requiere ser administrador del proyecto).",
          "error",
        );
      } else {
        notify(
          raw || "No se pudo crear el ambiente. Revisa el slug (único en el proyecto) e inténtalo de nuevo.",
          "error",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ambiente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo ambiente</DialogTitle>
          <DialogDescription>
            Añade un ambiente adicional a este proyecto. El slug debe ser único dentro del proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="env-name">Nombre</Label>
              <Input
                id="env-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ej. QA, Preview, cliente-x"
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="env-slug">Slug</Label>
              <Input
                id="env-slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="qa"
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Solo letras minúsculas, números y guiones. Debe ser único en este proyecto.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando…" : "Crear ambiente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
