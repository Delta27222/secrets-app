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
import { Home, Layers, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectEnvironments } from "@/components/project-environments"
import { ProjectMembers } from "@/components/project-members"
import { ProjectSettings } from "@/components/project-settings"
import { useProjectsInfo } from "@/hooks"

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
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

  React.useEffect(() => {
    if (status === "authenticated" && params.id) {
      api.setToken(session.accessToken)
      fetchProject(params.id as string)
    }
  }, [status, params.id])

  const handleProjectUpdated = () => {
    if (params.id) {
      fetchProject(params.id as string)
    }
  }


  if (status === "loading" || loading ) {
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
          </TabsList>

          <TabsContent value="environments">{project && <ProjectEnvironments projectId={project._id} />}</TabsContent>

          <TabsContent value="members">{project && <ProjectMembers projectId={project._id} />}</TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
