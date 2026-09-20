"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { useApi } from "@/components/api-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNotify } from "@/hooks";

type DeleteEnvironmentDialogProps = {
  environmentId: string;
  environmentName: string;
  onDeleted: (environmentId: string) => void | Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function DeleteEnvironmentDialog({
  environmentId,
  environmentName,
  onDeleted,
  disabled,
  children,
}: DeleteEnvironmentDialogProps) {
  const api = useApi();
  const notify = useNotify();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.deleteEnvironment(environmentId);
      setOpen(false);
      notify("Ambiente eliminado correctamente.", "success");
      await onDeleted(environmentId);
    } catch (err) {
      console.error("Error deleting environment:", err);
      const raw = err instanceof Error ? err.message : "";
      if (
        raw.includes("401") ||
        raw.toLowerCase().includes("not have permissions") ||
        raw.toLowerCase().includes("permission")
      ) {
        notify(
          "No tienes permiso para eliminar este ambiente (se requiere ser administrador del proyecto y dueño de la organización).",
          "error",
        );
      } else if (raw.includes("404") || raw.toLowerCase().includes("not found")) {
        notify("No se encontró el ambiente o ya fue eliminado.", "error");
      } else {
        notify(raw || "No se pudo eliminar el ambiente. Inténtalo de nuevo.", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            disabled={disabled}
            aria-label="Eliminar ambiente"
            title="Eliminar ambiente"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este ambiente?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará permanentemente <span className="font-medium text-foreground">{environmentName}</span> y sus
            variables asociadas. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
