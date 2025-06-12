"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import type { ProjectMember, OrganizationMembershipDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, UserX, User, MoreHorizontal, UserCog } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotify } from "@/hooks";

interface ProjectMembersProps {
  projectId: string;
}

export function ProjectMembers({ projectId }: ProjectMembersProps) {
  const api = useApi();
  const notify = useNotify();
  const [members, setMembers] = React.useState<ProjectMember[]>([]);
  const [organizationMembers, setOrganizationMembers] = React.useState<
    OrganizationMembershipDetail[]
  >([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingOrgMembers, setLoadingOrgMembers] =
    React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] =
    React.useState<boolean>(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] =
    React.useState<boolean>(false);
  const [selectedMember, setSelectedMember] =
    React.useState<ProjectMember | null>(null);
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [addMemberForm, setAddMemberForm] = React.useState({
    role: "viewer" as "admin" | "collab" | "viewer",
  });
  const [editMemberForm, setEditMemberForm] = React.useState({
    role: "viewer" as "admin" | "collab" | "viewer",
  });
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [organizationId, setOrganizationId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    fetchMembers();
  }, [projectId]);

  async function fetchMembers() {
    try {
      setLoading(true);
      const data = await api.getProjectMembers(projectId);
      setMembers(data);

      // Obtener el ID de la organización del primer miembro
      if (data.length > 0 && data[0].project.organization_id) {
        setOrganizationId(data[0].project.organization_id);
      } else {
        // Si no hay miembros, obtener los detalles del proyecto para conseguir el ID de la organización
        const projectDetails = await api.getProject(projectId);
        setOrganizationId(projectDetails.organization_id);
      }
    } catch (err) {
      console.error("Error fetching project members:", err);
      setError(
        "No se pudieron cargar los miembros del proyecto. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  const fetchOrganizationMembers = async () => {
    if (!organizationId) return;

    try {
      setLoadingOrgMembers(true);
      const data = await api.getOrganizationMemberships(organizationId);
      // Filtrar solo los miembros aceptados
      const acceptedMembers = data.filter(
        (member) => member.status === "accepted"
      );
      setOrganizationMembers(acceptedMembers);
    } catch (err) {
      console.error("Error fetching organization members:", err);
      notify("No se pudieron cargar los miembros de la organización.", "error");
    } finally {
      setLoadingOrgMembers(false);
    }
  };

  const handleOpenAddMemberDialog = () => {
    fetchOrganizationMembers();
    setAddMemberDialogOpen(true);
    setSelectedUserIds([]); // Reset selected users when dialog opens
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0 || !projectId) return;

    try {
      setIsSubmitting(true);

      // Add all selected users
      await Promise.all(
        selectedUserIds.map((userId) =>
          api.addProjectMember(projectId, {
            project: projectId,
            user: userId,
            role: addMemberForm.role,
          })
        )
      );

      setAddMemberDialogOpen(false);
      setSelectedUserIds([]);
      setAddMemberForm({
        role: "viewer",
      });
      fetchMembers();
      notify("Miembros añadidos correctamente.", "success");
    } catch (err) {
      console.error("Error adding project members:", err);
      notify("No se pudieron añadir los miembros al proyecto.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      setIsSubmitting(true);
      await api.updateProjectMember(selectedMember._id, editMemberForm.role);
      setEditMemberDialogOpen(false);
      fetchMembers();
      notify("Rol actualizado correctamente", "success");
    } catch (err) {
      console.error("Error updating project member:", err);
      notify(
        "No se pudo actualizar el rol del miembro. Por favor, intenta de nuevo más tarde.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.removeProjectMember(memberId);
      fetchMembers();
      notify("Miembro eliminado correctamente", "success");
    } catch (err) {
      console.error("Error removing project member:", err);
      notify("No se pudo eliminar el miembro del proyecto. Por favor, intenta de nuevo más tarde.", "error");
    }
  };

  const openEditMemberDialog = (member: ProjectMember) => {
    setSelectedMember(member);
    setEditMemberForm({
      role: member.role,
    });
    setEditMemberDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-blue-500">Administrador</Badge>;
      case "collab":
        return <Badge className="bg-green-500">Colaborador</Badge>;
      case "viewer":
        return <Badge className="bg-gray-500">Visualizador</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Verificar si un usuario ya es miembro del proyecto
  const isAlreadyMember = (userId: string) => {
    return members.some((member) => member.user._id === userId);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando miembros...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Miembros del Proyecto</h3>
        <Dialog
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
        >
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddMemberDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir Miembros al Proyecto</DialogTitle>
              <DialogDescription>
                Selecciona miembros de la organización y asígnales un rol en
                este proyecto.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMember}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="users">Miembros de la Organización</Label>
                  {loadingOrgMembers ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                      <span>Cargando miembros...</span>
                    </div>
                  ) : (
                    <Command className="rounded-lg border">
                      <CommandInput placeholder="Buscar miembros..." />
                      <CommandEmpty>No se encontraron miembros.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {organizationMembers.map((member) => {
                          const userId = member.user?._id || "";
                          const isDisabled = isAlreadyMember(userId);
                          const isSelected = selectedUserIds.includes(userId);

                          return (
                            <CommandItem
                              key={member._id}
                              value={
                                member.user?.displayName ||
                                member.user?.username ||
                                member.email
                              }
                              onSelect={() =>
                                !isDisabled && toggleUserSelection(userId)
                              }
                              className={cn(
                                "cursor-pointer",
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              <span>
                                {member.user?.displayName ||
                                  member.user?.username ||
                                  member.email}
                                {isDisabled && " (Ya es miembro)"}
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={addMemberForm.role}
                    onValueChange={(value) =>
                      setAddMemberForm({
                        ...addMemberForm,
                        role: value as "admin" | "collab" | "viewer",
                      })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="collab">Colaborador</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">
                    {selectedUserIds.length}{" "}
                    {selectedUserIds.length === 1
                      ? "miembro seleccionado"
                      : "miembros seleccionados"}
                  </span>
                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedUserIds.length === 0}
                  >
                    {isSubmitting ? "Añadiendo..." : "Añadir Miembros"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">
            No hay miembros en este proyecto
          </h3>
          <p className="text-muted-foreground mb-6">
            Añade miembros para colaborar en este proyecto.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b">
            <div className="col-span-5">Usuario</div>
            <div className="col-span-3">Rol</div>
            <div className="col-span-3"></div>
            <div className="col-span-1">Acciones</div>
          </div>
          {members.map((member) => (
            <div
              key={member._id}
              className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">
                    {member.user.displayName || member.user.username}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email}
                  </div>
                </div>
              </div>
              <div className="col-span-3">{getRoleBadge(member.role)}</div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {""}
              </div>
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openEditMemberDialog(member)}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Cambiar Rol
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => handleRemoveMember(member._id)}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={editMemberDialogOpen}
        onOpenChange={setEditMemberDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Miembro</DialogTitle>
            <DialogDescription>
              Actualiza el rol de{" "}
              {selectedMember?.user.displayName || selectedMember?.user.email}{" "}
              en este proyecto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editMemberForm.role}
                  onValueChange={(value) =>
                    setEditMemberForm({
                      ...editMemberForm,
                      role: value as "admin" | "collab" | "viewer",
                    })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="collab">Colaborador</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar Rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
