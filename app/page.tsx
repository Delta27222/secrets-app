"use client"

import React from "react"
import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useApi, useApiReady } from "@/components/api-provider"
import { Building2, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemberships, useRequireAuth } from "@/hooks"
import { Loading } from "@/components/V2/Common/Loading"
import { OrganizationsGrid } from "@/components/V2/Organization/OrganizationsGrid"

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
  const apiReady = useApiReady();
  const { session, isLoading: authLoading, isRedirecting } = useRequireAuth();
  const [activeTab, setActiveTab] = React.useState("organizations");

  React.useEffect(() => {
    if (session?.accessToken) {
      api.setToken(session.accessToken)
      fetchUserOrganizationMembership()
    }
  }, [session, apiReady])

  if (authLoading || isRedirecting) {
    return <Loading message="Cargando..." />
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
              <OrganizationsGrid memberships={memberships} />
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

