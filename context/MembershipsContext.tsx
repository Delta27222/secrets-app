"use client";

import React from "react";
import { useApi, useApiReady } from "@/components/api-provider";
import { Organization, OrganizationMembership, OrganizationMembershipDetail, Project } from "@/lib/api";
import { useSession } from "next-auth/react";

export type TMembershipsContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  memberships: OrganizationMembership[];
  setMemberships: React.Dispatch<
    React.SetStateAction<OrganizationMembership[]>
  >;
  members: OrganizationMembershipDetail[];
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMembershipDetail[]>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  organizationId: string;
  setOrganizationId: React.Dispatch<React.SetStateAction<string>>;
  organization: Organization | null;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loadingOgr: boolean;
  setLoadingOgr: React.Dispatch<React.SetStateAction<boolean>>;
  loadingProjects: boolean;
  setLoadingProjects: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMemberships: boolean;
  setLoadingMemberships: React.Dispatch<React.SetStateAction<boolean>>;

  //Functions
  fetchOrganizationMembers: (organizationId: string) => Promise<void>;
  fetchAllData: (organizationId: string) => Promise<void>;
  fetchUserRole: (organizationId: string) => Promise<void>;
  fetchOrganization: (organizationId: string) => Promise<void>;
  fetchUserOrganizationMembership: () => Promise<void>;
  fetchMyProjectsByOrganization: (organizationId: string) => Promise<void>;
  fetchJustNeededData: (organizationId: string) => Promise<void>;
};
export const MembershipsContext = React.createContext<TMembershipsContext>({
  loading: true,
  setLoading: () => {},
  memberships: [],
  setMemberships: () => {},
  error: null,
  setError: () => {},
  members: [],
  setMembers: () => {},
  userRole: null,
  setUserRole: () => {},
  organizationId: "",
  setOrganizationId: () => {},
  organization: null,
  setOrganization: () => {},
  projects: [],
  setProjects: () => {},
  loadingOgr: false,
  setLoadingOgr: () => {},
  loadingProjects: false,
  setLoadingProjects: () => {},
  loadingMemberships: false,
  setLoadingMemberships: () => {},

  //Functions
  fetchOrganizationMembers: async (organizationId: string) => {},
  fetchAllData: async () => {},
  fetchUserRole: async () => {},
  fetchOrganization: async () => {},
  fetchUserOrganizationMembership: async () => {},
  fetchMyProjectsByOrganization: async () => {},
  fetchJustNeededData: async (organizationId: string) => {},
});

type Props = {
  children: React.ReactNode;
};

export function MembershipsProvider({ children }: Props) {
  const api = useApi();
  const apiReady = useApiReady();
  const { data: session, status } = useSession();

  const [error, setError] = React.useState<string | null>(null);
  const [memberships, setMemberships] = React.useState<
    OrganizationMembership[]
  >([]);
  const [members, setMembers] = React.useState<OrganizationMembershipDetail[]>([]);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [organizationId, setOrganizationId] = React.useState<string>("");
  const [organization, setOrganization] = React.useState<Organization | null>(
    null
  );
  const [projects, setProjects] = React.useState<Project[]>([]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingOgr, setLoadingOgr] = React.useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(false);
  const [loadingMemberships, setLoadingMemberships] =
    React.useState<boolean>(false);

  async function fetchAllData(organizationId: string) {
    try {
      setLoading(true);
      const [orgData, projectsData, membershipsData] = await Promise.all([
        api.getOrganization(organizationId),
        api.getMyProjectsByOrganization(organizationId),
        api.getOrganizationMemberships(organizationId),
      ]);
      setOrganization(orgData);
      setProjects(projectsData);

      // Buscar la membresía del usuario actual para determinar su rol
      const email = session?.user?.email;
      if (email) {
        const acceptedMemberships = membershipsData.filter(m => m.status === "accepted");
        const userMembership = acceptedMemberships.find(m => m.user?.email === email);

        if (userMembership) {
          setUserRole(userMembership.role);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserRole(organizationId: string) {
    try {
      setLoadingMemberships(true);
      const membershipsData = await api.getOrganizationMemberships(organizationId);

      const email = session?.user?.email;
      if (email) {
        const acceptedMemberships = membershipsData.filter(m => m.status === "accepted");
        const userMembership = acceptedMemberships.find(m => m.user?.email === email);

        if (userMembership) {
          setUserRole(userMembership.role);
        }
      }
    } catch (err) {
      console.error("Error fetching memberships:", err);
      setError(
        "No se pudieron cargar los miembros de la organización. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoadingMemberships(false);
    }
  }

  async function fetchOrganization(organizationId: string) {
    setOrganizationId(organizationId);
    try {
      setLoadingOgr(true);
      const data = await api.getOrganization(organizationId);
      setOrganization(data);
    } catch (err) {
      console.error("Error fetching organization:", err);
      setError(
        "No se pudieron cargar los datos de la organización. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoadingOgr(false);
    }
  }

  async function fetchUserOrganizationMembership() {
    try {
      setLoadingMemberships(true);
      console.log("Iniciando petición para obtener membresías");
      const data = await api.getMyOrganizationMemberships();
      console.log("Membresías obtenidas:", data);
      setMemberships(data);
    } catch (err) {
      console.error("Error fetching organization memberships:", err);
      setError(
        "No se pudieron cargar las organizaciones. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoadingMemberships(false);
    }
  }

  async function fetchMyProjectsByOrganization(organizationId: string) {
    setOrganizationId(organizationId);
    try {
      setLoadingProjects(true);
      const data = await api.getMyProjectsByOrganization(organizationId);
      setProjects(data);
    } catch (err) {
      console.error("Error fetching my projects by organization:", err);
      setError(
        "No se pudieron cargar los proyectos. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoadingProjects(false);
    }
  }

  async function fetchJustNeededData(organizationId: string) {
    if (status === "authenticated") {
      api.setToken(session.accessToken);
      setOrganizationId(organizationId);
      if (!userRole) {
        setLoadingMemberships(true);
        await fetchUserRole(organizationId);
      }
      if (!organization) {
        setLoadingOgr(true);
        await fetchOrganization(organizationId);
      }
      if (!projects.length) {
        setLoadingProjects(true);
        await fetchMyProjectsByOrganization(organizationId);
      }
    }
  }

  async function fetchOrganizationMembers(organizationId: string) {
    try {
      setLoading(true)
      const data = await api.getOrganizationMemberships(organizationId)
      setMembers(data)
    } catch (err) {
      console.error("Error fetching members:", err)
      setError("No se pudieron cargar los miembros. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const value = React.useMemo(
    () => ({
      loading,
      setLoading,
      memberships,
      setMemberships,
      error,
      setError,
      userRole,
      setUserRole,
      organizationId,
      setOrganizationId,
      organization,
      setOrganization,
      projects,
      setProjects,
      members,
      setMembers,
      loadingOgr,
      setLoadingOgr,
      loadingProjects,
      setLoadingProjects,
      loadingMemberships,
      setLoadingMemberships,

      //Functions
      fetchAllData,
      fetchOrganizationMembers,
      fetchUserRole,
      fetchOrganization,
      fetchUserOrganizationMembership,
      fetchMyProjectsByOrganization,
      fetchJustNeededData,
    }),
    [
      loading,
      setLoading,
      memberships,
      setMemberships,
      error,
      setError,
      userRole,
      setUserRole,
      organizationId,
      setOrganizationId,
      organization,
      setOrganization,
      members,
      setMembers,
      projects,
      setProjects,
      loadingOgr,
      setLoadingOgr,
      loadingProjects,
      setLoadingProjects,
      loadingMemberships,
      setLoadingMemberships,

      //Functions
      fetchAllData,
      fetchOrganizationMembers,
      fetchUserRole,
      fetchOrganization,
      fetchUserOrganizationMembership,
      fetchMyProjectsByOrganization,
      fetchJustNeededData,
    ]
  );

  return (
    <MembershipsContext.Provider value={value}>
      {children}
    </MembershipsContext.Provider>
  );
}
