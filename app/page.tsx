"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi, useApiReady } from "@/components/api-provider"
import type { OrganizationMembership } from "@/lib/api"
import { Building2, Lock, Plus, Users } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingInvitations } from "@/components/pending-invitations"
import { CreateOrganizationForm } from "@/components/create-organization-form"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const api = useApi()
  const apiReady = useApiReady()
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("organizations")

  useEffect(() => {
    // Solo hacemos la petición si la API está lista (tiene token configurado)
    if (status === "authenticated") {
      api.setToken(session.accessToken)
      console.log("API lista, obteniendo membresías de organizaciones")
      fetchOrganizationMemberships()
    }
  }, [status, apiReady])

  async function fetchOrganizationMemberships() {
    try {
      setLoading(true)
      console.log("Iniciando petición para obtener membresías")
      const data = await api.getMyOrganizationMemberships()
      console.log("Membresías obtenidas:", data)
      setMemberships(data)
    } catch (err) {
      console.error("Error fetching organization memberships:", err)
      setError("No se pudieron cargar las organizaciones. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationAccepted = () => {
    fetchOrganizationMemberships()
  }

  if (status === "loading") {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user} />
      <main className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="organizations">Mis Organizaciones</TabsTrigger>
              <TabsTrigger value="invitations">Invitaciones Pendientes</TabsTrigger>
            </TabsList>

            {activeTab === "organizations" && (
              <CreateOrganizationForm onOrganizationCreated={fetchOrganizationMemberships} />
            )}

          </div>

          <TabsContent value="organizations">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Cargando organizaciones...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : memberships.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No perteneces a ninguna organización</h3>
                <p className="text-muted-foreground mb-6">
                  Crea una nueva organización para comenzar a gestionar secretos.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Crear Organización
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {memberships.map((membership) => (
                  <Card key={membership._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{membership.organization.name}</CardTitle>
                      <CardDescription>{membership.organization.description || "Sin descripción"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Rol: {membership.role === "owner" ? "Dueño" : membership.role === "admin" ? "Administrador" : "Miembro"}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Gestiona secretos de forma segura</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/organizations/${membership.organization._id}`}>Ver Organización</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations">
            <PendingInvitations onInvitationAccepted={handleInvitationAccepted} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

