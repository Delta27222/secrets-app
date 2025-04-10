"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useApi, useApiReady } from "@/components/api-provider"
import type { ProjectDetail } from "@/lib/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Settings, Layers, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectEnvironments } from "@/components/project-environments"
import { ProjectMembers } from "@/components/project-members"
import { ProjectSettings } from "@/components/project-settings"

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  const apiReady = useApiReady()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("environments")
  const [userProjectRole, setUserProjectRole] = useState<string | null>(null)
  const [userOrgRole, setUserOrgRole] = useState<string | null>(null)


  useEffect(() => {
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


  async function fetchProject(projectId: string) {
    try {
      setLoading(true)
      const projectData = await api.getProject(projectId)
      setProject(projectData)

      // Obtener el rol del usuario en el proyecto
      const projectMembers = await api.getProjectMembers(projectId)
      if (session?.user?.email) {
        const userMembership = projectMembers.find((m) => m.user.email === session.user.email)
        if (userMembership) {
          setUserProjectRole(userMembership.role)
        }
      }

      // Obtener el rol del usuario en la organización
      if (projectData.organization_id && session?.user?.email) {
        const orgMembers = await api.getOrganizationMemberships(projectData.organization_id)
        const userOrgMembership = orgMembers.find(
          (m) => m.user?.email === session.user.email && m.status === "accepted",
        )
        if (userOrgMembership) {
          setUserOrgRole(userOrgMembership.role)
        }
      }
    } catch (err) {
      console.error("Error fetching project:", err)
      setError("No se pudieron cargar los datos del proyecto. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
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
            {project && userProjectRole && userOrgRole && (
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
