"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApi, useApiReady } from "@/components/api-provider"
import type { Organization, Project } from "@/lib/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, FolderKanban, Plus, Lock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationMembers } from "@/components/organization-members"
import { OrganizationSettings } from "@/components/organization-settings"
import { CreateProjectForm } from "@/components/create-project-form"

export default function OrganizationPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  api.setToken(session?.accessToken)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("projects")
  const [userRole, setUserRole] = useState<string | null>(null)


  useEffect(() => {
    if (status === "authenticated" && params.id) {
      api.setToken(session.accessToken)
      fetchData(params.id as string)
    }
  }, [status, params.id])

  const handleOrganizationUpdated = () => {
    if (params.id) {
      fetchData(params.id as string)
    }
  }

  async function fetchData(organizationId: string) {
    try {
      setLoading(true)
      const [orgData, projectsData, membershipsData] = await Promise.all([
        api.getOrganization(organizationId),
        api.getMyProjectsByOrganization(organizationId),
        api.getOrganizationMemberships(organizationId),
      ])
      setOrganization(orgData)
      setProjects(projectsData)

      // Buscar la membresía del usuario actual para determinar su rol
      if (session?.user?.email) {
        const userMembership = membershipsData.find(
          (m) => m.user?.email === session.user.email && m.status === "accepted",
        )
        if (userMembership) {
          setUserRole(userMembership.role)
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
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
         
          {organization && userRole && (
              <OrganizationSettings
                organization={organization}
                onOrganizationUpdated={handleOrganizationUpdated}
                userRole={userRole}
              />
            )}
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Mis Proyectos</h2>
              {(userRole === "owner" || userRole === "admin" || userRole === "ADMIN") && (
                <CreateProjectForm
                  organizationId={params.id as string}
                  onProjectCreated={() => fetchData(params.id as string)}
                />
              )}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No tienes acceso a ningún proyecto</h3>
                <p className="text-muted-foreground mb-6">
                  Crea un nuevo proyecto o solicita acceso a proyectos existentes.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Crear Proyecto
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project._id}</CardDescription>
                      <CardDescription>{project.description || "Sin descripción"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FolderKanban className="mr-2 h-4 w-4" />
                        <span>Proyecto</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/projects/${project._id}`}>Ver Proyecto</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            <OrganizationMembers organizationId={params.id as string} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

