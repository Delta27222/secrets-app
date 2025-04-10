"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/components/api-provider"
import type { OrganizationMembership, OrganizationMembershipDetail } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Mail, UserCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface PendingInvitationsProps {
  onInvitationAccepted?: () => void
}

export function PendingInvitations({ onInvitationAccepted }: PendingInvitationsProps) {
  const api = useApi()
  const [pendingInvitations, setPendingInvitations] = useState<OrganizationMembershipDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingInvitations()
  }, [])

  async function fetchPendingInvitations() {
    try {
        setLoading(true)
        const data = await api.getMyPendingMemberships()
        setPendingInvitations(data)
    } catch (err) {
      console.error("Error fetching pending invitations:", err)
      setError("No se pudieron cargar las invitaciones pendientes. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (memberId: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(memberId))
      await api.acceptMembership(memberId)
      setPendingInvitations((prev) => prev.filter((invitation) => invitation._id !== memberId))
      if (onInvitationAccepted) onInvitationAccepted()
    } catch (err) {
      console.error("Error accepting invitation:", err)
      setError("No se pudo aceptar la invitación. Por favor, intenta de nuevo más tarde.")
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev)
        updated.delete(memberId)
        return updated
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-purple-500">Propietario</Badge>
      case "admin":
        return <Badge className="bg-blue-500">Administrador</Badge>
      default:
        return <Badge>Miembro</Badge>
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando invitaciones...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  if (pendingInvitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No tienes invitaciones pendientes</h3>
        <p className="text-muted-foreground">Cuando alguien te invite a una organización, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pendingInvitations.map((invitation) => (
        <Card key={invitation._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{invitation.organization?.name || "Organización"}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {invitation.createdAt
                ? `Invitación recibida ${formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true, locale: es })}`
                : "Invitación pendiente"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              {getRoleBadge(invitation.role)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pendiente
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleAcceptInvitation(invitation._id)}
              disabled={processingIds.has(invitation._id)}
            >
              {processingIds.has(invitation._id) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Aceptando...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Aceptar Invitación
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

