"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Header } from "@/components/header";
import { useApi } from "@/components/api-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, FolderKanban, Users, Logs, KeyRound, Info, TriangleAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateProjectForm } from "@/components/create-project-form";
import { ProjectsGrid } from "@/components/projects-grid";
import { useMemberships, useRequireAuth } from "@/hooks";
import { useLogs } from "@/hooks/useLogs";
import type { LogLevel } from "@/context/LogsContext";
import { defaultLogsColumns } from "@/components/V2/Columns/DefaultColumns";
import { errorLogsColumns } from "@/components/V2/Columns/ErrorColumns";

const OrganizationMembers = dynamic(() =>
  import("@/components/organization-members").then((mod) => ({
    default: mod.OrganizationMembers,
  })),
);
const OrganizationSettings = dynamic(() =>
  import("@/components/organization-settings").then((mod) => ({
    default: mod.OrganizationSettings,
  })),
);
const LogsTable = dynamic(() => import("@/components/V2/Logs/LogsTable"));
const SystemTokensManager = dynamic(() =>
  import("@/components/V2/SystemTokens/SystemTokensManager").then((mod) => ({
    default: mod.SystemTokensManager,
  })),
);

export default function OrganizationPage() {
  const api = useApi();
  const params = useParams();
  const { session, isLoading: authLoading, isRedirecting } = useRequireAuth();
  const [activeTab, setActiveTab] = React.useState("projects");
  const [logLevel, setLogLevel] = React.useState<LogLevel>("INFO");

  const {
    loadingOgr,
    loadingProjects,
    loadingMemberships,
    error,
    organization,
    userRole,
    projects,
    fetchAllData,
    setOrganizationId,
    fetchJustNeededData,
    fetchOrganization,
  } = useMemberships();
  const {
    logs,
    loading: logsLoading,
    fetchOrganizationLogs,
    pagination,
    goToPage,
    changePerPage,
  } = useLogs();

  const canSeeLogs = userRole === "owner" || userRole === "admin";
  const loading = loadingOgr || loadingProjects || loadingMemberships;

  React.useEffect(() => {
    if (session?.accessToken && params.id) {
      api.setToken(session.accessToken);
      setOrganizationId(params.id as string);
      fetchJustNeededData(params.id as string);
    }
  }, [session, params.id]);

  // Al cambiar de nivel se vuelve a la página 1: los totales son distintos y
  // conservar la página actual dejaría la tabla fuera de rango.
  React.useEffect(() => {
    if (activeTab === "logs") {
      fetchOrganizationLogs(1, pagination?.per_page, logLevel);
    }
  }, [activeTab, logLevel]);

  const handleOrganizationUpdated = () => {
    if (params.id) {
      fetchOrganization(params.id as string, { silent: true });
    }
  };

  if (authLoading || isRedirecting || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={session?.user} />
        <main className="container mx-auto py-10 px-4">
          <div className="text-center py-12 text-red-500">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user} />
      <main className="container mx-auto py-10 px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4 mr-1" />
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                {organization?.name || "Organización"}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{organization?.name}</h1>
            {organization?.description && (
              <p className="text-muted-foreground mt-1">
                {organization.description}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            {organization && userRole && (
              <OrganizationSettings
                organization={organization}
                onOrganizationUpdated={handleOrganizationUpdated}
                userRole={userRole}
              />
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="projects" className="flex items-center">
              <FolderKanban className="mr-2 h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Miembros
            </TabsTrigger>
            {canSeeLogs && (
              <>
                <TabsTrigger value="tokens" className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center">
                  <Logs className="mr-2 h-4 w-4" />
                  Logs
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-end">
              {/* Solo mostrar el botón de crear proyecto si el usuario es admin o owner */}
              {(userRole === "owner" || userRole === "admin") && (
                <CreateProjectForm
                  organizationId={params.id as string}
                  onProjectCreated={() => fetchAllData(params.id as string)}
                />
              )}
            </div>

            <ProjectsGrid projects={projects} />
          </TabsContent>
          <TabsContent value="members">
            <OrganizationMembers organizationId={params.id as string} />
          </TabsContent>
          {canSeeLogs && (
            <TabsContent value="logs">
              {/* Info y Error viven en la misma tabla Logs; el nivel se filtra en
                  el backend, no en cliente, para que la paginación siga cuadrando. */}
              <Tabs
                value={logLevel}
                onValueChange={(value) => setLogLevel(value as LogLevel)}
                className="mb-4"
              >
                <TabsList>
                  <TabsTrigger value="INFO">
                    <Info className="h-4 w-4 mr-2" />
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="ERROR">
                    <TriangleAlert className="h-4 w-4 mr-2" />
                    Errores
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <LogsTable
                title={logLevel === "ERROR" ? "Errores de la organización" : "Logs de la organización"}
                logs={logs}
                loading={logsLoading}
                columns={logLevel === "ERROR" ? errorLogsColumns : defaultLogsColumns}
                pagination={
                  pagination
                    ? {
                        currentPage: pagination.page,
                        totalPages: pagination.total_pages,
                        total: pagination.total,
                        perPage: pagination.per_page,
                        onPageChange: goToPage,
                        onPerPageChange: changePerPage,
                      }
                    : undefined
                }
              />
            </TabsContent>
          )}
          {canSeeLogs && (
            <TabsContent value="tokens">
              <SystemTokensManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
