"use client";
import React from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useProjectEnvironments, useRenderActions } from "@/hooks";

/** Evita iconos/autofill de gestores (Bitwarden, 1Password, LastPass, etc.) en credenciales de integración. */
const IGNORE_PASSWORD_MANAGER: Record<string, string> = {
  autoComplete: "off",
  "data-bwignore": "",
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-form-type": "other",
};

export function RenderSyncForm() {
  const didFetchRef = React.useRef(false);
  const [showToken, setShowToken] = React.useState(false);
  const { loading, formData, setFormData, fetchRenderData, handleSubmit } =
    useRenderActions();
  const { selectedEnvironment } = useProjectEnvironments();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  React.useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchRenderData();
  }, [selectedEnvironment]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" autoComplete="off">
      <div className="flex w-full flex-col gap-5">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="render_token">API Key de Render</Label>
          <div className="relative w-full">
            <Input
              id="render_token"
              name="render_token"
              type={showToken ? "text" : "password"}
              value={formData.render_token}
              onChange={handleChange}
              placeholder="rkp_… o token de la cuenta"
              className={cn("w-full pr-10", showToken && "font-mono text-sm")}
              {...IGNORE_PASSWORD_MANAGER}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? "Ocultar API key" : "Mostrar API key"}
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Crea una clave en Render → Account → API Keys.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="render_server_id">Service ID</Label>
          <Input
            id="render_server_id"
            name="render_server_id"
            value={formData.render_server_id}
            onChange={handleChange}
            placeholder="srv-…"
            className="w-full"
            {...IGNORE_PASSWORD_MANAGER}
          />
          <p className="text-xs text-muted-foreground">
            ID del servicio web en el dashboard de Render (Settings del servicio).
          </p>
        </div>
        <Button type="submit" className="w-full sm:w-auto sm:self-start">
          <Save className="h-4 w-4" aria-hidden />
          Actualizar credenciales
        </Button>
      </div>
    </form>
  );
}
