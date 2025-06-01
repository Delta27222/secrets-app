"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogContainer } from "./ui/V2/DialogContainer/DialogContainer";
import { TabViewSecrets } from "./V2/Tabs/TabViewSecrets";
import { TabEditSecrets } from "./V2/Tabs/TabEditSecrets";
import { getEnvironmentBadge } from "./V2/Badge/EnviromentBadge";
import { useProjectEnvironments } from "@/hooks";
import { EnvironmentCard } from "./V2/EnvironmentCard/EnvironmentCard";
import { RenderLogoIcon, VercelLogoIcon } from "./ui/V2/icons";
import { RenderSyncForm } from "./V2/Forms/RenderSyncForm";
import { VercelSyncForm } from "./V2/Forms/VercelSyncForm";

interface ProjectEnvironmentsProps {
  projectId: string;
}

export function ProjectEnvironments({ projectId }: ProjectEnvironmentsProps) {
  const {
    environments,
    loading,
    error,
    selectedEnvironment,
    environmentDetailsOpen,
    setEnvironmentDetailsOpen,
    activeTab,
    setActiveTab,
    setEnvText,
    dialogToOpen,
    fetchEnvironments,
  } = useProjectEnvironments();

  React.useEffect(() => {
    fetchEnvironments();
  }, [projectId]);

  // Efecto para generar el texto .env cuando se selecciona un ambiente
  React.useEffect(() => {
    if (selectedEnvironment && activeTab === "edit") {
      const envContent = Object.entries(selectedEnvironment.secrets || {})
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
      setEnvText(envContent);
    }
  }, [selectedEnvironment, activeTab]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando ambientes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Ambientes del Proyecto</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ambiente
        </Button>
      </div>

      {environments.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">
            No hay ambientes configurados
          </h3>
          <p className="text-muted-foreground mb-6">
            Crea un nuevo ambiente para comenzar a gestionar variables de
            entorno.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Crear Ambiente
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((environment, index) => (
            <EnvironmentCard key={index} environment={environment} />
          ))}
        </div>
      )}

      {selectedEnvironment && dialogToOpen === "secrets" ? (
        <DialogContainer
          dialogInfo={{
            title: selectedEnvironment?.name || "",
            description:
              "Variables de entorno configuradas para este ambiente.",
            badge: selectedEnvironment
              ? getEnvironmentBadge(selectedEnvironment.slug)
              : null,
            isOpen: environmentDetailsOpen,
            setIsOpen: setEnvironmentDetailsOpen,
          }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">Ver Variables</TabsTrigger>
              <TabsTrigger value="edit">Editar Variables</TabsTrigger>
            </TabsList>
            <TabViewSecrets />
            <TabEditSecrets />
          </Tabs>
        </DialogContainer>
      ) : null}

      {dialogToOpen === "render" ? (
        <DialogContainer
          dialogInfo={{
            title: "Sync to",
            badge: <RenderLogoIcon className={`w-[80px]`} />,
            isOpen: environmentDetailsOpen,
            setIsOpen: setEnvironmentDetailsOpen,
            className: "md:max-w-md",
          }}
          closeButton={false}
        >
          <RenderSyncForm />
        </DialogContainer>
      ) : null}

      {dialogToOpen === "vercel" ? (
        <DialogContainer
          dialogInfo={{
            title: "Sync to",
            badge: <VercelLogoIcon className={`w-[80px]`} />,
            isOpen: environmentDetailsOpen,
            setIsOpen: setEnvironmentDetailsOpen,
            className: "max-w-md",
          }}
          closeButton={false}
        >
          <VercelSyncForm />
        </DialogContainer>
      ) : null}
    </div>
  );
}
