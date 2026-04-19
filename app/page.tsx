"use client"

import React from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi, useApiReady } from "@/components/api-provider"
import { Building2, Lock, Plus, Users } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemberships } from "@/hooks"
import { Loading } from "@/components/V2/Common/Loading"

const PendingInvitations = dynamic(() => import("@/components/pending-invitations").then(mod => ({ default: mod.PendingInvitations })))
const CreateOrganizationForm = dynamic(() => import("@/components/create-organization-form").then(mod => ({ default: mod.CreateOrganizationForm })))

export default function Home() {
  const {
    loadingMemberships,
    memberships,
    error,
    fetchUserOrganizationMembership,
  } = useMemberships();
  const api = useApi();
  const router = useRouter();
  const apiReady = useApiReady();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = React.useState("organizations");

  React.useEffect(() => {
    if (status === "authenticated") {
      api.setToken(session.accessToken)
      fetchUserOrganizationMembership()
    }
  }, [status, apiReady])

  if (status === "loading") {
    return <Loading message="Cargando..." />
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
              <CreateOrganizationForm onOrganizationCreated={fetchUserOrganizationMembership} />
            )}

          </div>

          <TabsContent value="organizations">
            {loadingMemberships ? (
              <Loading message="Cargando organizaciones..." />
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
                      {/* <CardDescription>{membership.organization.description || "Sin descripción"}</CardDescription> */}
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
            <PendingInvitations onInvitationAccepted={fetchUserOrganizationMembership} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

