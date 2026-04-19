"use client";
import React from "react";
import { Eye, EyeOff, Copy, Check, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  useProjectEnvironments,
  useProjectsInfo,
  useRenderActions,
  useVercelActions,
} from "@/hooks";

export function TabViewSecrets() {
  const { userOrgRole, userProjectRole } = useProjectsInfo();
  const { handleSyncToRender, loading: synToRenderLoading } =
    useRenderActions();
  const {
    selectedEnvironment,
    copiedSecrets,
    showSecrets,
    setShowSecrets,
    handleCopyAllSecrets,
    handleCopySecret,
    setDialogToOpen,
    setActiveTab,
  } = useProjectEnvironments();

  const { fetchVercelData, loading: synToVercelLoading } = useVercelActions();
  const { render_server_id, render_token, vercel_project_id, vercel_token } =
    selectedEnvironment || {};

  const canSync = userProjectRole === "admin" && userOrgRole === "owner";
  const isRenderEnvironment = render_server_id && render_token;
  const isVercelEnvironment = vercel_project_id && vercel_token;

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

      {!selectedEnvironment ||
      Object.keys(selectedEnvironment.secrets || {}).length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No hay variables configuradas en este ambiente.
          </p>
          <Button
            type="button"
            variant="link"
            className="mt-2 h-auto gap-1.5 p-0 text-sm font-medium"
            onClick={() => setActiveTab("edit")}
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Agregar variables
          </Button>
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
      {canSync ? (
        <div className="flex flex-row justify-end items-center gap-5">
          {/* Solo renderizar el botón de sincronización con Render si las credenciales están presentes */}
          {isRenderEnvironment && canSync ? (
            <Button
              type="button"
              className="flex items-center gap-2"
              disabled={synToRenderLoading}
              onClick={(e) => {
                e.preventDefault();
                if (
                  selectedEnvironment?.project_id &&
                  selectedEnvironment?.slug
                ) {
                  handleSyncToRender(e);
                }
              }}
            >
              {synToRenderLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sincronizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Sincronizar con Render
                </>
              )}
            </Button>
          ) : null}

          {/* Solo renderizar el botón de sincronización con Vercel si las credenciales están presentes */}
          {isVercelEnvironment && canSync ? (
            <Button
              onClick={async (e) => {
                e.preventDefault();
                if (
                  selectedEnvironment?.project_id &&
                  selectedEnvironment?.slug
                ) {
                  await fetchVercelData();
                  setDialogToOpen("vercel_select_target");
                }
              }}
              type="button"
              className="flex items-center gap-2"
              disabled={false}
            >
              {synToVercelLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Sincronizar con Vercel
                </>
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
    </TabsContent>
  );
}
