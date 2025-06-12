"use client";
import React from "react";
import { Eye, EyeOff, Copy, Check, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Environment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/components/api-provider";
import { parseEnvText } from "@/utils/parseEnvText";
import { useProjectEnvironments } from "@/hooks";

export function TabEditSecrets() {
  const {
    envText,
    setEnvText,
    isSaving,
    handleSaveEnvironment,
  } = useProjectEnvironments();

  // Referencia para el textarea
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <TabsContent value="edit">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">
            Editar Variables en formato .env
          </h4>
        </div>

        <div className="bg-muted p-2 rounded-md text-xs text-muted-foreground">
          <p>Formato: KEY=VALUE (una variable por línea)</p>
          <p>Ejemplo: DATABASE_URL=postgres://user:pass@localhost:5432/db</p>
        </div>

        <Textarea
          ref={textareaRef}
          value={envText}
          onChange={(e) => setEnvText(e.target.value)}
          className="font-mono text-sm h-80"
          placeholder="KEY=value"
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSaveEnvironment}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
