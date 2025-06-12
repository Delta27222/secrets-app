"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import { Environment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { parseEnvText } from "@/utils/parseEnvText";
import { useParams } from "next/navigation";
import { useNotify } from "@/hooks";

export type TProjectEnvironmentsContext = {
  environments: Environment[];
  setEnvironments: React.Dispatch<React.SetStateAction<Environment[]>>;
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: React.Dispatch<
    React.SetStateAction<Environment | null>
  >;
  showSecrets: boolean;
  setShowSecrets: React.Dispatch<React.SetStateAction<boolean>>;
  environmentDetailsOpen: boolean;
  setEnvironmentDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  envText: string;
  setEnvText: React.Dispatch<React.SetStateAction<string>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  copiedSecrets: Record<string, boolean>;
  setCopiedSecrets: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  dialogToOpen: string;
  setDialogToOpen: React.Dispatch<React.SetStateAction<string>>;

  // Functions
  fetchEnvironments: () => Promise<void>;
  handleViewEnvironment: (environmentSlug: string) => Promise<void>;
  handleCopyAllSecrets: () => void;
  handleCopySecret: (key: string, value: string) => void;
  handleSaveEnvironment: () => Promise<void>;
};
export const ProjectEnvironmentsContext =
  React.createContext<TProjectEnvironmentsContext>({
    environments: [],
    setEnvironments: () => {},
    selectedEnvironment: null,
    setSelectedEnvironment: () => {},
    showSecrets: false,
    setShowSecrets: () => {},
    environmentDetailsOpen: false,
    setEnvironmentDetailsOpen: () => {},
    activeTab: "view",
    setActiveTab: () => {},
    envText: "",
    setEnvText: () => {},
    isSaving: false,
    setIsSaving: () => {},
    copiedSecrets: {},
    setCopiedSecrets: () => {},
    loading: true,
    setLoading: () => {},
    error: null,
    setError: () => {},
    dialogToOpen: "",
    setDialogToOpen: () => {},

    // Functions
    fetchEnvironments: async () => {},
    handleViewEnvironment: async (_: string) => {},
    handleCopyAllSecrets: () => {},
    handleCopySecret: (_: string, __: string) => {},
    handleSaveEnvironment: async () => {},
  });

type Props = {
  children: React.ReactNode;
};

export function ProjectEnvironmentsProvider({ children }: Props) {
  const param = useParams();
  const api = useApi();
  const notify = useNotify();
  const [environments, setEnvironments] = React.useState<Environment[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] =
    React.useState<Environment | null>(null);
  const [showSecrets, setShowSecrets] = React.useState<boolean>(false);
  const [environmentDetailsOpen, setEnvironmentDetailsOpen] =
    React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<string>("view");
  const [envText, setEnvText] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [copiedSecrets, setCopiedSecrets] = React.useState<
    Record<string, boolean>
  >({});
  const [dialogToOpen, setDialogToOpen] = React.useState<string>('');

  async function fetchEnvironments() {
    try {
      setLoading(true);
      const data = await api.getProjectEnvironments(`${param.id}`);
      setEnvironments(data.environments);
    } catch (err) {
      console.error("Error fetching environments:", err);
      setError(
        "No se pudieron cargar los ambientes. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleViewEnvironment = async (environmentSlug: string) => {
    try {
      const environmentDetails = await api.getEnvironmentDetails(
        param.id as string,
        environmentSlug
      );
      setSelectedEnvironment(environmentDetails);
      setEnvironmentDetailsOpen(true);
      setShowSecrets(false);
      setActiveTab("view");
      setCopiedSecrets({});
      setDialogToOpen('secrets');
    } catch (err) {
      console.error("Error fetching environment details:", err);
      setError(
        "No se pudieron cargar los detalles del ambiente. Por favor, intenta de nuevo más tarde."
      );
    }
  };

  const handleCopyAllSecrets = () => {
    if (!selectedEnvironment) return;

    const allSecrets = Object.entries(selectedEnvironment.secrets || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    navigator.clipboard.writeText(allSecrets).then(
      () => {
        notify(
          "Copiado al portapapeles.",
          "success"
        );
      },
      (err) => {
        console.error("No se pudo copiar el texto: ", err);
        notify(
          "Error al copiar las variables de entorno. Por favor, intenta de nuevo.",
          "error"
        );
      }
    );
  };

  const handleCopySecret = (key: string, value: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        // Actualizar el estado para mostrar el ícono de confirmación
        setCopiedSecrets((prev) => ({ ...prev, [key]: true }));

        // Restablecer después de 2 segundos
        setTimeout(() => {
          setCopiedSecrets((prev) => ({ ...prev, [key]: false }));
        }, 2000);

        notify(
          "Copiado al portapapeles.",
          "success"
        );
      },
      (err) => {
        console.error("No se pudo copiar el texto: ", err);
        notify("No se pudo copiar el valor al portapapeles.", "error");
      }
    );
  };

  const handleSaveEnvironment = async () => {
    if (!selectedEnvironment) return;

    try {
      setIsSaving(true);

      // Parsear el texto .env a un objeto de secretos
      const secrets = parseEnvText(envText);

      // Preparar los datos para la actualización
      const updateData = {
        name: selectedEnvironment.name,
        slug: selectedEnvironment.slug,
        secrets: secrets,
      };

      // Llamar a la API para actualizar
      await api.updateEnvironment(selectedEnvironment._id, updateData);

      // Actualizar el ambiente seleccionado con los nuevos secretos
      setSelectedEnvironment({
        ...selectedEnvironment,
        secrets: secrets,
      });

      // Refrescar la lista de ambientes
      fetchEnvironments();

      // Cambiar a la pestaña de visualización
      setActiveTab("view");

      notify(
        "Las variables de entorno han sido actualizadas correctamente.",
        "success"
      );
    } catch (err) {
      console.error("Error updating environment:", err);
      notify(
        "No se pudieron actualizar las variables de entorno.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const value = React.useMemo(
    () => ({
      environments,
      setEnvironments,
      loading,
      setLoading,
      error,
      setError,
      selectedEnvironment,
      setSelectedEnvironment,
      showSecrets,
      setShowSecrets,
      environmentDetailsOpen,
      setEnvironmentDetailsOpen,
      activeTab,
      setActiveTab,
      envText,
      setEnvText,
      isSaving,
      setIsSaving,
      copiedSecrets,
      setCopiedSecrets,
      dialogToOpen,
      setDialogToOpen,
      // Functions
      fetchEnvironments,
      handleViewEnvironment,
      handleCopyAllSecrets,
      handleCopySecret,
      handleSaveEnvironment,
    }),
    [
      environments,
      setEnvironments,
      loading,
      setLoading,
      error,
      setError,
      selectedEnvironment,
      setSelectedEnvironment,
      showSecrets,
      setShowSecrets,
      environmentDetailsOpen,
      setEnvironmentDetailsOpen,
      activeTab,
      setActiveTab,
      envText,
      setEnvText,
      isSaving,
      setIsSaving,
      copiedSecrets,
      setCopiedSecrets,
      dialogToOpen,
      setDialogToOpen,
      handleCopyAllSecrets,
      handleCopySecret,
      handleSaveEnvironment,
    ]
  );

  return (
    <ProjectEnvironmentsContext.Provider value={value}>
      {children}
    </ProjectEnvironmentsContext.Provider>
  );
}
