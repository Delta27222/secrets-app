"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import {
  ProjectDetail,
  ProjectMember,
} from "@/lib/api";
import { useSession } from "next-auth/react";
import { useMemberships } from "@/hooks";

export type FetchProjectOptions = {
  /** Si es true, no activa `loading` (evita pantalla completa de carga al refrescar tras guardar). */
  silent?: boolean;
};

export type TProjectsInfoContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingProjectMembers: boolean;
  setLoadingProjectMembers: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  project: ProjectDetail | null;
  setProject: React.Dispatch<React.SetStateAction<ProjectDetail | null>>;
  userProjectRole: string | null;
  setUserProjectRole: React.Dispatch<React.SetStateAction<string | null>>;
  userOrgRole: string | null;
  setUserOrgRole: React.Dispatch<React.SetStateAction<string | null>>;
  projectMembers: ProjectMember[];
  setProjectMembers: React.Dispatch<React.SetStateAction<ProjectMember[]>>;
  //Functions
  fetchProject: (projectId: string, options?: FetchProjectOptions) => Promise<void>;
  fetchProjectMembers: (projectId: string) => Promise<void>;
};
export const ProjectsInfoContext = React.createContext<TProjectsInfoContext>({
  loading: false,
  setLoading: () => {},
  loadingProjectMembers: false,
  setLoadingProjectMembers: () => {},
  error: null,
  setError: () => {},
  project: null,
  setProject: () => {},
  userProjectRole: null,
  setUserProjectRole: () => {},
  userOrgRole: null,
  setUserOrgRole: () => {},
  projectMembers: [],
  setProjectMembers: () => {},
  //Functions
  fetchProject: async (_: string, __?: FetchProjectOptions) => {},
  fetchProjectMembers: async () => {},
});

type Props = {
  children: React.ReactNode;
};

export function ProjectsInfoProvider({ children }: Props) {
  const api = useApi();
  const { data: session, status } = useSession();
  const { setOrganizationId } = useMemberships();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingProjectMembers, setLoadingProjectMembers] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [userProjectRole, setUserProjectRole] = React.useState<string | null>(
    null
  );
  const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([]);
  const [userOrgRole, setUserOrgRole] = React.useState<string | null>(null);

  const fetchProject = React.useCallback(
    async (projectId: string, options?: FetchProjectOptions) => {
      const silent = options?.silent ?? false;
      try {
        if (!silent) {
          setLoading(true);
        }
        // Fetch project and members in parallel
        const [projectData, projectMembers] = await Promise.all([
          api.getProject(projectId),
          api.getProjectMembers(projectId),
        ]);
        setProject(projectData);

        // Obtener el rol del usuario en el proyecto
        if (session?.user?.email) {
          const membersMap = new Map(
            projectMembers.map((member) => [member.user.email, member])
          );
          const userMembership = membersMap.get(session.user.email);
          if (userMembership) {
            setUserProjectRole(userMembership.role);
          }
        }

        //  Obtener el rol del usuario en la organización
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
        console.error("Error fetching project:", err);
        setError(
          "No se pudieron cargar los datos del proyecto. Por favor, intenta de nuevo más tarde."
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [api, session?.user?.email],
  );

  const fetchProjectMembers = React.useCallback(async (projectId: string) => {
    try {
      setLoadingProjectMembers(true);
      const data = await api.getProjectMembers(projectId);
      setProjectMembers(data);
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
      setLoadingProjectMembers(false);
    }
  }, [api, setOrganizationId]);

  const value = React.useMemo(
    () => ({
      loading,
      setLoading,
      loadingProjectMembers,
      setLoadingProjectMembers,
      error,
      setError,
      project,
      setProject,
      userProjectRole,
      setUserProjectRole,
      userOrgRole,
      setUserOrgRole,
      projectMembers,
      setProjectMembers,
      fetchProject,
      fetchProjectMembers,
    }),
    [
      loading,
      loadingProjectMembers,
      error,
      project,
      userOrgRole,
      userProjectRole,
      projectMembers,
      fetchProject,
      fetchProjectMembers,
    ]
  );

  return (
    <ProjectsInfoContext.Provider value={value}>
      {children}
    </ProjectsInfoContext.Provider>
  );
}
