"use client";
import React from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotify, useProjectEnvironments, useVercelActions } from "@/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VercelSelectProjectTargetForm() {
  const notify = useNotify();
  const {
    formData,
    setFormData,
    handleGetVercelMismatches,
    fetchVercelProjectTargets,
    targets,
    loadingTargets,
    loading,
  } = useVercelActions();
  const { setDialogToOpen } = useProjectEnvironments();

  const lastRequestRef = React.useRef({
    projectId: "",
    token: "",
  });
  React.useEffect(() => {
    if (!formData) return;

    const { project_id, vercel_token } = formData;
    if (
      lastRequestRef.current.projectId === project_id &&
      lastRequestRef.current.token === vercel_token
    ) {
      return;
    }
    lastRequestRef.current = { projectId: project_id, token: vercel_token };
    fetchVercelProjectTargets();
  }, [formData, fetchVercelProjectTargets]);

  if (loadingTargets) {
    return (
      <div className="flex flex-row justify-center items-center gap-4 scale-75">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Obteniendo targets de proyecto desde Vercel...</p>
      </div>
    );
  }

  const handlerSubmit = (e: React.FormEvent) => {
    const target = formData.vercel_target[0];
    if (!target) {
      notify("Por favor, selecciona un target de Vercel.", "error");
      return;
    }
    handleGetVercelMismatches(e);
  };

  return (
    <form onSubmit={handlerSubmit}>
      <div className="flex flex-col items-center space-y-5">
        {targets.length > 0 ? (
          <>
            <Select
              value={formData.vercel_target?.[0] || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  vercel_target: [value],
                })
              }
            >
              <SelectTrigger id="vercel_target">
                <SelectValue placeholder="Selecciona un target" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((target) => (
                  <SelectItem key={target} value={target}>
                    {target.charAt(0).toUpperCase() + target.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-row justify-end items-center gap-4 w-full">
              <Button
                variant={"destructive"}
                onClick={() => setDialogToOpen("secrets")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.vercel_target?.[0]}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Sincronizar con Vercel
                  </>
                )}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}
