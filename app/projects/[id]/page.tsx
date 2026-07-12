"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { useApi } from "@/components/api-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Layers, Users, Logs, Key } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProjectsInfo, useRequireAuth } from "@/hooks"
import { useLogs } from "@/hooks/useLogs"
import { customEnvironmentsColumns } from "@/components/V2/Columns/EnvironmentsColumns"

const ProjectEnvironments = dynamic(() => import("@/components/project-environments").then(mod => ({ default: mod.ProjectEnvironments })))
const ProjectMembers = dynamic(() => import("@/components/project-members").then(mod => ({ default: mod.ProjectMembers })))
const ProjectSettings = dynamic(() => import("@/components/project-settings").then(mod => ({ default: mod.ProjectSettings })))
const LogsTable = dynamic(() => import("@/components/V2/Logs/LogsTable"))
const ServiceTokensManager = dynamic(() => import("@/components/V2/ServiceTokens/ServiceTokensManager").then(mod => ({ default: mod.ServiceTokensManager })))

export default function ProjectDetailPage() {
  const { session, isLoading: authLoading, isRedirecting } = useRequireAuth()
  const params = useParams()
  const api = useApi()
  const [activeTab, setActiveTab] = React.useState("environments")

  const {
    fetchProject,
    error,
    loading,
    project,
    userProjectRole,
    userOrgRole,
  } = useProjectsInfo()
  const canSeeLogs = userProjectRole === "admin" || userOrgRole === "owner";
  const {
    logs,
    loading: logsLoading,
    fetchEnvironmentsLogs,
    pagination,
    goToPage,
    changePerPage
  } = useLogs()

  React.useEffect(() => {
    if (session?.accessToken && params.id) {
      api.setToken(session.accessToken)
      fetchProject(params.id as string)
    }
  }, [session, params.id])

  React.useEffect(() => {
    if (activeTab === "logs") {
      fetchEnvironmentsLogs(pagination?.page, pagination?.per_page)
    }
  }, [activeTab])

  const handleProjectUpdated = () => {
    if (params.id) {
      fetchProject(params.id as string, { silent: true })
    }
  }


  if (authLoading || isRedirecting || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={session?.user} />
        <main className="container mx-auto py-10 px-4">
          <div className="text-center py-12 text-red-500">{error}</div>
        </main>
      </div>
    )
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
              <BreadcrumbLink href={`/organizations/${project?.organization_id}`}>Organización</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{project?.name || "Proyecto"}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            {project?.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
          </div>
          <div className="flex space-x-3">
            {project && (userProjectRole || userOrgRole) && (
              <ProjectSettings
                project={project}
                userProjectRole={userProjectRole}
                userOrgRole={userOrgRole}
                onProjectUpdated={handleProjectUpdated}
              />
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="environments" className="flex items-center">
              <Layers className="mr-2 h-4 w-4" />
              Ambientes
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Miembros
            </TabsTrigger>
            {(userProjectRole === "admin" || userOrgRole === "owner" || userOrgRole === "admin") && (
              <TabsTrigger value="service-tokens" className="flex items-center">
                <Key className="mr-2 h-4 w-4" />
                Tokens de Servicio
              </TabsTrigger>
            )}
            {canSeeLogs ? (
              <TabsTrigger value="logs" className="flex items-center">
                <Logs className="mr-2 h-4 w-4" />
                Logs
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="environments">{project && <ProjectEnvironments projectId={project._id} />}</TabsContent>

          <TabsContent value="members">{project && <ProjectMembers projectId={project._id} />}</TabsContent>

          {(userProjectRole === "admin" || userOrgRole === "owner" || userOrgRole === "admin") && (
            <TabsContent value="service-tokens">
              {project && <ServiceTokensManager projectId={project._id} />}
            </TabsContent>
          )}

          <TabsContent value="logs">
            {project && (
              <LogsTable
                title="Logs de ambientes"
                logs={logs}
                loading={logsLoading}
                columns={customEnvironmentsColumns}
                pagination={pagination ? {
                  currentPage: pagination.page,
                  totalPages: pagination.total_pages,
                  total: pagination.total,
                  perPage: pagination.per_page,
                  onPageChange: goToPage,
                  onPerPageChange: changePerPage,
                } : undefined}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
