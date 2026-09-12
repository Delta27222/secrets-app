"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import { Log, PaginationMeta } from "@/lib/api";
import { MinimalUser } from "@/lib/api";

// Tipo extendido para logs enriquecidos con información completa del usuario
export interface EnrichedLog extends Omit<Log, 'user'> {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

export type LogLevel = "INFO" | "ERROR";

export type TLogsContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logs: EnrichedLog[];
  setLogs: React.Dispatch<React.SetStateAction<EnrichedLog[]>>;
  pagination: PaginationMeta | null;
  setPagination: React.Dispatch<React.SetStateAction<PaginationMeta | null>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  perPage: number;
  setPerPage: React.Dispatch<React.SetStateAction<number>>;

  // Functions
  fetchEnvironmentsLogs: (environmentIds: string[], page?: number, perPage?: number, level?: LogLevel) => Promise<void>;
  fetchOrganizationLogs: (page?: number, perPage?: number, level?: LogLevel) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  changePerPage: (newPerPage: number) => Promise<void>;
};
export const LogsContext = React.createContext<TLogsContext>({
  loading: true,
  setLoading: () => {},
  logs: [],
  setLogs: () => {},
  pagination: null,
  setPagination: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  perPage: 20,
  setPerPage: () => {},

  // Functions
  fetchEnvironmentsLogs: async () => {},
  fetchOrganizationLogs: async () => {},
  goToPage: async () => {},
  changePerPage: async () => {},
});

type Props = {
  children: React.ReactNode;
};

export function LogsProvider({ children }: Props) {
  const api = useApi();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [logs, setLogs] = React.useState<EnrichedLog[]>([]);
  const [pagination, setPagination] = React.useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [perPage, setPerPage] = React.useState<number>(5);
  const [users, setUsers] = React.useState<MinimalUser[]>([]);
  const lastFetchTypeRef = React.useRef<'org' | 'env'>('org');
  const lastLevelRef = React.useRef<LogLevel | undefined>(undefined);
  // Se recuerdan para que paginar no pierda el filtro por ambientes.
  const lastEnvironmentIdsRef = React.useRef<string[]>([]);
  // Nivel propio de la vista de ambientes. Separado del de organización porque
  // el provider es global: al navegar entre páginas el ref sobrevive y un tab de
  // errores dejaría el valor puesto para la siguiente vista.
  const lastEnvLevelRef = React.useRef<LogLevel | undefined>(undefined);

  // Los ids de ambiente llegan por parámetro a propósito. Antes se leían con
  // useProjectEnvironments() aquí dentro, pero LogsProvider vive en el layout raíz,
  // POR ENCIMA de ProjectEnvironmentsProvider: el hook devolvía siempre el valor por
  // defecto ([]), la URL salía sin target_ids y el backend respondía con todos los
  // logs de la instalación. La página sí está dentro del provider y los tiene.
  const fetchEnvironmentsLogs = React.useCallback(async (environmentIds: string[], page: number = currentPage, perPageParam: number = perPage, level?: LogLevel) => {
    try {
      setLoading(true);
      lastFetchTypeRef.current = 'env';
      lastEnvironmentIdsRef.current = environmentIds;
      const effectiveLevel = level ?? lastEnvLevelRef.current;
      lastEnvLevelRef.current = effectiveLevel;

      if (environmentIds.length === 0) {
        setLogs([]);
        setPagination(null);
        return;
      }

      const response = await api.getEnvironmentsLogs(environmentIds, page, perPageParam, effectiveLevel);

      // Change the user id to the user object
      const enrichedLogs = await enrichLogsWithUsers(response.data);
      setLogs(enrichedLogs);
      setPagination(response.meta);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching environments logs:", err);
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, perPage]);

  const fetchOrganizationLogs = React.useCallback(async (page: number = currentPage, perPageParam: number = perPage, level?: LogLevel) => {
    try {
      setLoading(true);
      lastFetchTypeRef.current = 'org';
      // Se recuerda el nivel para que paginar o cambiar el tamaño de página no
      // salte del tab de errores al de info.
      const effectiveLevel = level ?? lastLevelRef.current;
      lastLevelRef.current = effectiveLevel;
      const response = await api.getAllLogs(page, perPageParam, effectiveLevel);

      // Change the user id to the user object
      const enrichedLogs = await enrichLogsWithUsers(response.data);
      setLogs(enrichedLogs);
      setPagination(response.meta);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching all logs:", err);
    } finally {
      setLoading(false);
    }
  }, [api, currentPage, perPage]);

  const goToPage = React.useCallback(async (page: number) => {
    if (pagination && page >= 1 && page <= pagination.total_pages) {
      if (lastFetchTypeRef.current === 'env') {
        await fetchEnvironmentsLogs(lastEnvironmentIdsRef.current, page, perPage);
      } else {
        await fetchOrganizationLogs(page, perPage);
      }
    }
  }, [pagination, perPage, fetchEnvironmentsLogs, fetchOrganizationLogs]);

  const changePerPage = React.useCallback(async (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
    if (lastFetchTypeRef.current === 'env') {
      await fetchEnvironmentsLogs(lastEnvironmentIdsRef.current, 1, newPerPage);
    } else {
      await fetchOrganizationLogs(1, newPerPage);
    }
  }, [fetchEnvironmentsLogs, fetchOrganizationLogs]);

  // Function to fetch users if not in cache
  const fetchUsersIfNeeded = React.useCallback(async () => {
    if (users.length === 0) {
      try {
        const response = await api.getMinimalUsers();

        // Validate that the response is valid
        if (Array.isArray(response)) {
          setUsers(response);
          return response;
        } else {
          console.warn("Invalid users response format:", response);
          return [];
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        // In case of error, return empty array but don't fail
        return [];
      }
    }
    return users;
  }, [api, users]);

  const enrichLogsWithUsers = React.useCallback(async (logsData: Log[]): Promise<EnrichedLog[]> => {
    // Validate input
    if (!Array.isArray(logsData) || logsData.length === 0) {
      console.warn("No logs data provided or empty array");
      return [];
    }

    try {
      const usersData = await fetchUsersIfNeeded();

      // Validate that we have users data
      if (!Array.isArray(usersData) || usersData.length === 0) {
        console.warn("No users data available, returning logs with fallback user info");
        return logsData.map(log => {
          const userId = typeof log.user === 'string' ? log.user : log.user?.id || 'unknown';
          return {
            ...log,
            user: {
              id: userId,
              email: 'Usuario no disponible',
              displayName: 'Usuario no disponible'
            }
          };
        });
      }

      const enrichedLogs = logsData.map(log => {
        try {
          // Convert user id to string if needed
          const userId = typeof log.user === 'string' ? log.user : log.user?.id || 'unknown';

          // Validate that userId exists
          if (!userId || userId === 'unknown') {
            return {
              ...log,
              user: {
                id: 'unknown',
                email: 'ID de usuario no disponible',
                displayName: 'Usuario desconocido'
              }
            };
          }

          const userInfo = usersData.find(user => user && user.id === String(userId));

          return {
            ...log,
            user: userInfo ? {
              id: userInfo.id || userId,
              email: userInfo.email || 'Email no disponible',
              displayName: userInfo.displayName || userInfo.email || 'Usuario sin nombre'
            } : {
              id: userId,
              email: 'Usuario no encontrado',
              displayName: 'Usuario no encontrado'
            }
          };
        } catch (logError) {
          console.error(`Error processing individual log:`, logError);
          // If the processing of an individual log fails, return with basic info
          const userId = typeof log.user === 'string' ? log.user : log.user?.id || 'error';
          return {
            ...log,
            user: {
              id: userId,
              email: 'Error al procesar',
              displayName: 'Error al procesar'
            }
          };
        }
      });
      return enrichedLogs;
    } catch (err) {
      console.error("Error enriching logs with users:", err);

      // In case of error, return logs with basic info instead of failing completely
      return logsData.map(log => {
        const userId = typeof log.user === 'string' ? log.user : log.user?.id || 'unknown';
        return {
          ...log,
          user: {
            id: userId,
            email: 'Error al cargar datos',
            displayName: 'Error al cargar datos'
          }
        };
      });
    }
  }, [fetchUsersIfNeeded]);


  const value = React.useMemo(
    () => ({
      loading,
      setLoading,
      logs,
      setLogs,
      pagination,
      setPagination,
      currentPage,
      setCurrentPage,
      perPage,
      setPerPage,
      // Functions
      fetchEnvironmentsLogs,
      fetchOrganizationLogs,
      goToPage,
      changePerPage,
    }),
    [
      loading,
      logs,
      pagination,
      currentPage,
      perPage,
      fetchEnvironmentsLogs,
      fetchOrganizationLogs,
      goToPage,
      changePerPage,
    ]
  );

  return (
    <LogsContext.Provider value={value}>
      {children}
    </LogsContext.Provider>
  );
}
