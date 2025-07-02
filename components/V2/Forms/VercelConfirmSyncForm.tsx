"use client";
import React from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotify, useProjectEnvironments, useVercelActions } from "@/hooks";
import { Label } from "@/components/ui/label";
import { isValidVercelCredentials } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VercelConfirmSyncForm() {
  const { handleSyncToVercel, mismatches, loading, formData } = useVercelActions();
  const { setDialogToOpen } = useProjectEnvironments();
  return (
    <form onSubmit={(e) => handleSyncToVercel(e, true, formData.vercel_target[0])}>
      <div className="flex flex-col items-center space-y-5">
        <div className="bg-muted p-2 rounded-md text-xs text-muted-foreground w-full">
          <p>Estas son las variables disponibles en Vercel:</p>
          {mismatches.map((mismatch, index) => (
            <p key={index}>▪️{mismatch}</p>
          ))}
        </div>
        <div className="flex flex-row justify-end items-center gap-4 w-full">
          <Button variant={'destructive'} onClick={() => setDialogToOpen('secrets')}>
            Cancelar
          </Button>
          <Button type="submit">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sincronizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Confirmar Sincronización
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
