// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useApi } from "@/components/api-provider"
// import type { OrganizationMembershipDetail } from "@/lib/api"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { UserPlus, UserX, Mail, User, UserCheck, Clock } from "lucide-react"
// import { Badge } from "@/components/ui/badge"

// interface OrganizationMembersProps {
//   organizationId: string
//   onMembersUpdated?: () => void
// }

// export function OrganizationMembers({ organizationId, onMembersUpdated }: OrganizationMembersProps) {
//   const api = useApi()
//   const [members, setMembers] = useState<OrganizationMembershipDetail[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
//   const [inviteForm, setInviteForm] = useState({
//     email: "",
//     role: "member" as "owner" | "admin" | "collab",
//   })
//   const [inviting, setInviting] = useState(false)

//   useEffect(() => {
//     fetchMembers()
//   }, [organizationId])

//   async function fetchMembers() {
//     try {
//       setLoading(true)
//       const data = await api.getOrganizationMemberships(organizationId)
//       setMembers(data)
//     } catch (err) {
//       console.error("Error fetching members:", err)
//       setError("No se pudieron cargar los miembros. Por favor, intenta de nuevo más tarde.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleInviteSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!inviteForm.email) return

//     try {
//       setInviting(true)
//       await api.inviteOrganizationMember(organizationId, inviteForm)
//       setInviteDialogOpen(false)
//       setInviteForm({
//         email: "",
//         role: "collab",
//       })
//       fetchMembers()
//       if (onMembersUpdated) onMembersUpdated()
//     } catch (err) {
//       console.error("Error inviting member:", err)
//       setError("No se pudo invitar al miembro. Por favor, intenta de nuevo más tarde.")
//     } finally {
//       setInviting(false)
//     }
//   }

//   const handleRemoveMember = async (memberId: string) => {
//     try {
//       await api.removeOrganizationMember(memberId)
//       fetchMembers()
//       if (onMembersUpdated) onMembersUpdated()
//     } catch (err) {
//       console.error("Error removing member:", err)
//       setError("No se pudo eliminar al miembro. Por favor, intenta de nuevo más tarde.")
//     }
//   }

//   const getRoleBadge = (role: string) => {
//     switch (role) {
//       case "owner":
//         return <Badge className="bg-purple-500">Propietario</Badge>
//       case "admin":
//         return <Badge className="bg-blue-500">Administrador</Badge>
//       default:
//         return <Badge>Miembro</Badge>
//     }
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "accepted":
//         return (
//           <Badge variant="outline" className="w-fit border-green-500 text-green-500 flex items-center gap-1">
//             <UserCheck className="h-3 w-3" /> Aceptado
//           </Badge>
//         )
//       case "pending":
//         return (
//           <Badge variant="outline" className="w-fit border-amber-500 text-amber-500 flex items-center gap-1">
//             <Clock className="h-3 w-3" /> Pendiente
//           </Badge>
//         )
//       default:
//         return <Badge variant="outline">Desconocido</Badge>
//     }
//   }

//   if (loading) {
//     return (
//       <div className="text-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//         <p>Cargando miembros...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return <div className="text-center py-8 text-red-500">{error}</div>
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-xl font-semibold">Miembros de la Organización</h3>
//         <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <UserPlus className="mr-2 h-4 w-4" />
//               Invitar Miembro
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Invitar Nuevo Miembro</DialogTitle>
//               <DialogDescription>
//                 Envía una invitación por correo electrónico para unirse a esta organización.
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleInviteSubmit}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid gap-2">
//                   <Label htmlFor="email">Correo Electrónico</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="correo@ejemplo.com"
//                     value={inviteForm.email}
//                     onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label htmlFor="role">Rol</Label>
//                   <Select
//                     value={inviteForm.role}
//                     onValueChange={(value) =>
//                       setInviteForm({ ...inviteForm, role: value as "owner" | "admin" | "collab" })
//                     }
//                   >
//                     <SelectTrigger id="role">
//                       <SelectValue placeholder="Selecciona un rol" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="owner">Propietario</SelectItem>
//                       <SelectItem value="admin">Administrador</SelectItem>
//                       <SelectItem value="collab">Miembro</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button type="submit" disabled={inviting}>
//                   {inviting ? "Enviando invitación..." : "Enviar Invitación"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {members.length === 0 ? (
//         <div className="text-center py-8">
//           <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
//           <h3 className="text-lg font-medium mb-2">No hay miembros en esta organización</h3>
//           <p className="text-muted-foreground mb-6">Invita a miembros para colaborar en esta organización.</p>
//         </div>
//       ) : (
//         <div className="border rounded-md">
//           <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
//             <div className="col-span-5">Usuario</div>
//             <div className="col-span-3">Rol</div>
//             <div className="col-span-3">Estado</div>
//             <div className="col-span-1">Acciones</div>
//           </div>
//           {members.map((member) => (
//             <div key={member._id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
//               <div className="col-span-5 flex items-center gap-3">
//                 {member.user ? (
//                   <>
//                     <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
//                       <User className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className="font-medium">{member.user.displayName || member.user.username}</div>
//                       <div className="text-sm text-muted-foreground">{member.email}</div>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <Mail className="h-4 w-4 text-muted-foreground" />
//                     <span>{member.email}</span>
//                   </div>
//                 )}
//               </div>
//               <div className="col-span-3">{getRoleBadge(member.role)}</div>
//               <div className="col-span-3 ">{getStatusBadge(member.status)}</div>
//               <div className="col-span-1">
//                 <AlertDialog>
//                   <AlertDialogTrigger asChild>
//                     <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
//                       <UserX className="h-4 w-4" />
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <AlertDialogHeader>
//                       <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
//                       <AlertDialogDescription>
//                         Esta acción eliminará a {member.user?.displayName || member.email} de la organización. No podrá
//                         acceder a los recursos de la organización.
//                       </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
//                       <AlertDialogAction
//                         onClick={() => handleRemoveMember(member._id)}
//                         className="bg-red-500 hover:bg-red-600"
//                       >
//                         Eliminar
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


"use client"

import React from "react"
import { useApi } from "@/components/api-provider"
import type { OrganizationMembershipDetail } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserPlus, UserX, Mail, User, UserCheck, Clock, MoreHorizontal, UserCog } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useNotify } from "@/hooks"

interface OrganizationMembersProps {
  organizationId: string
  onMembersUpdated?: () => void
}

export function OrganizationMembers({ organizationId, onMembersUpdated }: OrganizationMembersProps) {
  const { data: session } = useSession()
  const api = useApi()
  const notify = useNotify();
  const [members, setMembers] = React.useState<OrganizationMembershipDetail[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState<boolean>(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState<boolean>(false)
  const [selectedMember, setSelectedMember] = React.useState<OrganizationMembershipDetail | null>(null)
  const [inviteForm, setInviteForm] = React.useState({
    email: "",
    role: "collab" as "owner" | "admin" | "collab",
  })
  const [editForm, setEditForm] = React.useState({
    role: "collab" as "owner" | "admin" | "collab",
  })
  const [inviting, setInviting] = React.useState<boolean>(false)
  const [updating, setUpdating] = React.useState<boolean>(false)
  const [currentUserRole, setCurrentUserRole] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchMembers()
  }, [organizationId])

  async function fetchMembers() {
    try {
      setLoading(true)
      const data = await api.getOrganizationMemberships(organizationId)
      setMembers(data)

      // Determinar el rol del usuario actual
      if (session?.user?.email) {
        const currentUserMembership = data.find(
          (member) => member.user?.email === session.user.email && member.status === "accepted",
        )
        if (currentUserMembership) {
          setCurrentUserRole(currentUserMembership.role)
        }
      }
    } catch (err) {
      console.error("Error fetching members:", err)
      setError("No se pudieron cargar los miembros. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.email) return

    try {
      setInviting(true)
      await api.inviteOrganizationMember(organizationId, inviteForm)
      setInviteDialogOpen(false)
      setInviteForm({
        email: "",
        role: "collab",
      })
      fetchMembers()
      if (onMembersUpdated) onMembersUpdated()
      notify("La invitación ha sido enviada correctamente.", "success");
    } catch (err) {
      console.error("Error inviting member:", err)
      notify("No se pudo invitar al miembro. Por favor, intenta de nuevo más tarde.", "error");
    } finally {
      setInviting(false)
    }
  }

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    try {
      setUpdating(true)
      await api.updateOrganizationMemberRole(selectedMember._id, editForm.role)
      setEditDialogOpen(false)
      fetchMembers()
      if (onMembersUpdated) onMembersUpdated()
      notify("Rol actualizado correctamente.", "success");
    } catch (err) {
      console.error("Error updating member role:", err)
      notify("No se pudo actualizar el rol del miembro. Por favor, intenta de nuevo más tarde.", "error");
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.removeOrganizationMember(memberId)
      fetchMembers()
      if (onMembersUpdated) onMembersUpdated()
      notify("Miembro eliminado correctamente.", "success");
    } catch (err) {
      console.error("Error removing member:", err)
      notify("No se pudo eliminar al miembro. Por favor, intenta de nuevo más tarde.", "error");
    }
  }

  const openEditDialog = (member: OrganizationMembershipDetail) => {
    setSelectedMember(member)
    setEditForm({
      role: member.role,
    })
    setEditDialogOpen(true)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Aceptado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pendiente
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  // Verificar si el usuario actual tiene permisos de administración
  const hasAdminPermissions = currentUserRole === "owner" || currentUserRole === "admin"

  // Verificar si se puede editar un miembro específico
  const canEditMember = (member: OrganizationMembershipDetail) => {
    // Los propietarios no pueden ser editados
    if (member.role === "owner") return false
    // Solo los propietarios pueden editar a los administradores
    if (member.role === "admin" && currentUserRole !== "owner") return false
    // El usuario no puede editarse a sí mismo
    if (member.user?.email === session?.user?.email) return false
    return hasAdminPermissions
  }

  // Verificar si se puede eliminar un miembro específico
  const canRemoveMember = (member: OrganizationMembershipDetail) => {
    // Los propietarios no pueden ser eliminados
    if (member.role === "owner") return false
    // Solo los propietarios pueden eliminar a los administradores
    if (member.role === "admin" && currentUserRole !== "owner") return false
    // El usuario no puede eliminarse a sí mismo
    if (member.user?.email === session?.user?.email) return false
    return hasAdminPermissions
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando miembros...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Miembros de la Organización</h3>
        {hasAdminPermissions && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Miembro</DialogTitle>
                <DialogDescription>
                  Envía una invitación por correo electrónico para unirse a esta organización.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) =>
                        setInviteForm({ ...inviteForm, role: value as "owner" | "admin" | "collab" })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUserRole === "owner" && <SelectItem value="owner">Propietario</SelectItem>}
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="collab">Miembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={inviting}>
                    {inviting ? "Enviando invitación..." : "Enviar Invitación"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay miembros en esta organización</h3>
          <p className="text-muted-foreground mb-6">Invita a miembros para colaborar en esta organización.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
            <div className="col-span-5">Usuario</div>
            <div className="col-span-3">Rol</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-1">Acciones</div>
          </div>
          {members.map((member) => (
            <div key={member._id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
              <div className="col-span-5 flex items-center gap-3">
                {member.user ? (
                  <>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{member.user.displayName || member.user.username}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{member.email}</span>
                  </div>
                )}
              </div>
              <div className="col-span-3">{getRoleBadge(member.role)}</div>
              <div className="col-span-3 w-fit">{getStatusBadge(member.status)}</div>
              <div className="col-span-1">
                {(canEditMember(member) || canRemoveMember(member)) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {canEditMember(member) && (
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Cambiar Rol
                        </DropdownMenuItem>
                      )}
                      {canRemoveMember(member) && (
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo para editar el rol de un miembro */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Miembro</DialogTitle>
            <DialogDescription>
              Actualiza el rol de {selectedMember?.user?.displayName || selectedMember?.email} en esta organización.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) =>
                    setEditForm({
                      ...editForm,
                      role: value as "owner" | "admin" | "collab",
                    })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {currentUserRole === "owner" && <SelectItem value="owner">Propietario</SelectItem>} */}
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="collab">Miembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updating}>
                {updating ? "Actualizando..." : "Actualizar Rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
