"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useApi } from "@/components/api-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, FolderKanban, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationMembers } from "@/components/organization-members"
import { OrganizationSettings } from "@/components/organization-settings"
// Importar el componente CreateProjectForm
import { CreateProjectForm } from "@/components/create-project-form"
import { ProjectsGrid } from "@/components/projects-grid"
import { useMemberships } from "@/hooks"


export default function OrganizationPage() {
  const api = useApi()
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = React.useState("projects")

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
  } = useMemberships();

  const loading = loadingOgr || loadingProjects || loadingMemberships;

  React.useEffect(() => {
    if (status === "authenticated" && params.id) {
      api.setToken(session.accessToken)
      console.log("API lista, obteniendo datos de la organización")
      setOrganizationId(params.id as string)
      fetchJustNeededData(params.id as string)
    }
  }, [status, params.id])

  const handleOrganizationUpdated = () => {
    if (params.id) {
      fetchJustNeededData(params.id as string)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
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
              <BreadcrumbLink>{organization?.name || "Organización"}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{organization?.name}</h1>
            {organization?.description && <p className="text-muted-foreground mt-1">{organization.description}</p>}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects" className="flex items-center">
              <FolderKanban className="mr-2 h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Miembros
            </TabsTrigger>
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
        </Tabs>
      </main>
    </div>
  )
}
