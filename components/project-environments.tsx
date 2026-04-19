"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogContainer } from "./ui/V2/DialogContainer/DialogContainer";
import { TabViewSecrets } from "./V2/Tabs/TabViewSecrets";
import { TabEditSecrets } from "./V2/Tabs/TabEditSecrets";
import { getEnvironmentBadge } from "./V2/Badge/EnviromentBadge";
import { useProjectEnvironments, useProjectsInfo } from "@/hooks";
import { EnvironmentCard } from "./V2/EnvironmentCard/EnvironmentCard";
import { RenderLogoIcon, VercelLogoIcon } from "./ui/V2/icons";
import { vercelDialogDescriptions } from "@/constants";
import { CreateEnvironmentDialog } from "@/components/create-environment-dialog";

const RenderSyncForm = dynamic(() => import("./V2/Forms/RenderSyncForm").then(mod => ({ default: mod.RenderSyncForm })), { ssr: false });
const VercelSyncForm = dynamic(() => import("./V2/Forms/VercelSyncForm").then(mod => ({ default: mod.VercelSyncForm })), { ssr: false });
const VercelSelectProjectTargetForm = dynamic(() => import("./V2/Forms/VercelSelectProjectTargetForm").then(mod => ({ default: mod.VercelSelectProjectTargetForm })), { ssr: false });
const VercelConfirmSyncForm = dynamic(() => import("./V2/Forms/VercelConfirmSyncForm").then(mod => ({ default: mod.VercelConfirmSyncForm })), { ssr: false });

interface ProjectEnvironmentsProps {
  projectId: string;
}

export function ProjectEnvironments({ projectId }: ProjectEnvironmentsProps) {
  const {
    environments,
    loading,
    error,
    selectedEnvironment,
    setSelectedEnvironment,
    environmentDetailsOpen,
    setEnvironmentDetailsOpen,
    activeTab,
    setActiveTab,
    setEnvText,
    dialogToOpen,
    fetchEnvironments,
  } = useProjectEnvironments();
  const { userProjectRole, userOrgRole } = useProjectsInfo();
  const canManageEnvironments =
    userProjectRole === "admin" && userOrgRole === "owner";

  const handleEnvironmentDeleted = React.useCallback(
    async (deletedId: string) => {
      if (selectedEnvironment?._id === deletedId) {
        setSelectedEnvironment(null);
        setEnvironmentDetailsOpen(false);
      }
      await fetchEnvironments();
    },
    [
      selectedEnvironment?._id,
      setSelectedEnvironment,
      setEnvironmentDetailsOpen,
      fetchEnvironments,
    ],
  );

  React.useEffect(() => {
    if (environments.length > 0) return;
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
        {canManageEnvironments ? (
          <CreateEnvironmentDialog
            projectId={projectId}
            onEnvironmentCreated={fetchEnvironments}
          />
        ) : null}
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
          {canManageEnvironments ? (
            <CreateEnvironmentDialog
              projectId={projectId}
              onEnvironmentCreated={fetchEnvironments}
            >
              <Button type="button">
                <Plus className="mr-2 h-4 w-4" /> Crear Ambiente
              </Button>
            </CreateEnvironmentDialog>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((environment) => (
            <EnvironmentCard
              key={environment._id}
              environment={environment}
              canDeleteEnvironment={canManageEnvironments}
              onEnvironmentDeleted={handleEnvironmentDeleted}
            />
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

      {dialogToOpen === "vercel" ||
      dialogToOpen === "vercel_select_target" ||
      dialogToOpen === "vercel_confirm_mismatches" ? (
        <DialogContainer
          dialogInfo={{
            title: "Sync to",
            badge: <VercelLogoIcon className={`w-[80px]`} />,
            isOpen: environmentDetailsOpen,
            setIsOpen: setEnvironmentDetailsOpen,
            className: "max-w-md",
            description: vercelDialogDescriptions[dialogToOpen] || "",
          }}
          closeButton={false}
        >
          {dialogToOpen === "vercel" ? <VercelSyncForm /> : null}
          {dialogToOpen === "vercel_select_target" ? (
            <VercelSelectProjectTargetForm />
          ) : null}
          {dialogToOpen === "vercel_confirm_mismatches" ? (
            <VercelConfirmSyncForm />
          ) : null}
        </DialogContainer>
      ) : null}
    </div>
  );
}
