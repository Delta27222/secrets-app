"use client";
import React from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useProjectEnvironments } from "@/hooks";

export function TabViewSecrets() {
  const {
    selectedEnvironment,
    copiedSecrets,
    showSecrets,
    setShowSecrets,
    handleCopyAllSecrets,
    handleCopySecret,
  } = useProjectEnvironments();

  return (
    <TabsContent value="view" className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Variables de Entorno</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCopyAllSecrets}
          >
            <Copy className="h-4 w-4" /> Copiar Todo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? (
              <>
                <EyeOff className="h-4 w-4" /> Ocultar Valores
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Mostrar Valores
              </>
            )}
          </Button>
        </div>
      </div>

      {!selectedEnvironment || Object.keys(selectedEnvironment.secrets || {}).length === 0 ? (
        <div className="text-center py-6 bg-muted rounded-md">
          <p className="text-muted-foreground">
            No hay variables configuradas en este ambiente.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm text-muted-foreground border-b">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-6">Valor</div>
            <div className="col-span-1">Acción</div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(selectedEnvironment.secrets || {}).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-4 p-3 border-b last:border-0 items-center"
                >
                  <div
                    className="col-span-5 font-mono text-sm truncate"
                    title={key}
                  >
                    {key}
                  </div>
                  <div className="col-span-6 font-mono text-sm truncate">
                    {showSecrets ? (
                      <span className="break-all" title={value}>
                        {value}
                      </span>
                    ) : (
                      <span>••••••••••••••••</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopySecret(key, value)}
                      title="Copiar valor"
                    >
                      {copiedSecrets[key] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </TabsContent>
  );
}
