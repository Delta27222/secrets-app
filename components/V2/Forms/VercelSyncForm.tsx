"use client";
import React from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjectEnvironments, useVercelActions } from "@/hooks";
import { Label } from "@/components/ui/label";

/** Evita iconos/autofill de gestores (Bitwarden, 1Password, LastPass, etc.) en credenciales de integración. */
const IGNORE_PASSWORD_MANAGER: Record<string, string> = {
  autoComplete: "off",
  "data-bwignore": "",
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-form-type": "other",
};

export function VercelSyncForm() {
  const didFetchRef = React.useRef(false);
  const [showToken, setShowToken] = React.useState(false);
  const {
    loading,
    formData,
    setFormData,
    fetchVercelData,
    handleSubmit,
  } = useVercelActions();
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
    fetchVercelData();
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
          <Label htmlFor="vercel_token">Token de Vercel</Label>
          <div className="relative w-full">
            <Input
              id="vercel_token"
              name="vercel_token"
              type={showToken ? "text" : "password"}
              value={formData.vercel_token}
              onChange={handleChange}
              placeholder="Token con scope adecuado al proyecto"
              className={cn("w-full pr-10", showToken && "font-mono text-sm")}
              {...IGNORE_PASSWORD_MANAGER}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? "Ocultar token" : "Mostrar token"}
            >
              {showToken ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Crea un token en Vercel → Account Settings → Tokens.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="vercel_project_id">ID del proyecto</Label>
          <Input
            id="vercel_project_id"
            name="vercel_project_id"
            value={formData.vercel_project_id}
            onChange={handleChange}
            placeholder="prj_…"
            className="w-full"
            {...IGNORE_PASSWORD_MANAGER}
          />
          <p className="text-xs text-muted-foreground">
            En el dashboard del proyecto: Settings → General → Project ID.
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
