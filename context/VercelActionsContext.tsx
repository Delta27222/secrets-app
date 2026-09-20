"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import { useNotify, useProjectEnvironments } from "@/hooks";
import { isValidVercelCredentials } from "@/lib/utils";

interface VercelData {
  vercel_project_id: string;
  vercel_token: string;
  environment_id: string;
  project_id: string;
  slug: string;
  vercel_target: string[];
}

export type TVercelActionsContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formData: VercelData;
  setFormData: React.Dispatch<React.SetStateAction<VercelData>>;
  mismatches: string[];
  setMismatches: React.Dispatch<React.SetStateAction<string[]>>;
  targets: string[];
  setTargets: React.Dispatch<React.SetStateAction<string[]>>;
  loadingTargets: boolean;
  setLoadingTargets: React.Dispatch<React.SetStateAction<boolean>>;
  // Functions
  fetchVercelData: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSyncToVercel: (e: React.FormEvent, removeMismatches?: boolean, targetName?: string) => Promise<void>;
  handleGetVercelMismatches: (e: React.FormEvent) => Promise<void>;
  fetchVercelProjectTargets: () => Promise<void>;
};
export const VercelActionsContext = React.createContext<TVercelActionsContext>({
  loading: true,
  setLoading: () => {},
  formData: {
    vercel_project_id: "",
    vercel_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
    vercel_target: [],
  },
  setFormData: () => {},
  mismatches: [],
  setMismatches: () => {},
  targets: [],
  setTargets: () => {},
  loadingTargets: false,
  setLoadingTargets: () => {},
  // Functions
  fetchVercelData: async () => {},
  handleSubmit: async (e: React.FormEvent) => {
    e.preventDefault();
  },
  handleSyncToVercel: async (e: React.FormEvent, removeMismatches = false) => {
    e.preventDefault();
    removeMismatches = false;
  },
  handleGetVercelMismatches: async (e: React.FormEvent) => {
    e.preventDefault();
  },
  fetchVercelProjectTargets: async () => {},
});

type Props = {
  children: React.ReactNode;
};

export function VercelActionsProvider({ children }: Props) {
  const api = useApi();
  const notify = useNotify();

  const {
    selectedEnvironment,
    setEnvironmentDetailsOpen,
    fetchEnvironments,
    setDialogToOpen,
  } = useProjectEnvironments();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<VercelData>({
    vercel_project_id: "",
    vercel_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
    vercel_target: [],
  });
  const [mismatches, setMismatches] = React.useState<string[]>([]);
  const [targets, setTargets] = React.useState<string[]>([]);
  const [loadingTargets, setLoadingTargets] = React.useState<boolean>(true);

  const fetchVercelData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (!selectedEnvironment?._id || !selectedEnvironment?.slug) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }

      const data = await api.getVercelInfo(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );

      setFormData({
        project_id: selectedEnvironment.project_id,
        vercel_project_id: data?.vercel_project_id || "",
        vercel_token: data?.vercel_token || "",
        environment_id: selectedEnvironment._id,
        slug: selectedEnvironment.slug,
        vercel_target: data?.vercel_target || [],
      });
    } catch (err) {
      console.error("Error fetching vercel data:", err);
      notify("Error al cargar los datos de Vercel.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, selectedEnvironment, notify]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?._id) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }
      if (!formData.vercel_project_id || !formData.vercel_token) {
        notify(
          "Por favor, completa el Service Id y el Api Key de Vercel.",
          "error"
        );
        return;
      }
      const data = await api.updateVercelInfo(
        selectedEnvironment._id,
        formData.vercel_project_id,
        formData.vercel_token,
        formData.vercel_target
      );
      if (data) {
        notify("Datos de Vercel actualizados.", "success");
        await fetchEnvironments();
        setEnvironmentDetailsOpen(false);
      }
    } catch (err) {
      console.error("Error al sincronizar datos de Vercel:", err);
      notify("Error al actualizar los datos de Vercel.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment, formData, api, notify, fetchEnvironments, setEnvironmentDetailsOpen]);

  const handleSyncToVercel = React.useCallback(async (
    e: React.FormEvent,
    removeMismatches = false,
    targetName = ""
  ) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?._id) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }
      const data = await api.syncSecretsToVercel(
        selectedEnvironment.project_id,
        selectedEnvironment.slug,
        removeMismatches,
        targetName
      );
      if (data.code === "success" || data.code === "success_removed_mismatched_secrets") {
        notify("Secretos sincronizados con Vercel.", "success");
        setDialogToOpen("secrets");
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
      notify("Hubo un error al sincronizar con Vercel.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment, api, notify, setDialogToOpen]);

  const handleGetVercelMismatches = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?.project_id || !selectedEnvironment?.slug) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }
      const data = await api.getVercelMismatches(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );
      if (data?.mismatches?.secretsMismatched?.length === 0) {
        await handleSyncToVercel(e, false, formData.vercel_target[0]);
        return;
      }
      setMismatches(data.mismatches.secretsMismatched || []);
      notify("Hay secretos desincronizados entre el entorno y Vercel.", "warning");
      setDialogToOpen("vercel_confirm_mismatches");
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener mismatches de Vercel:", err);
      notify("Error al obtener los mismatches de Vercel.", "error");
    }
  }, [selectedEnvironment, api, notify, formData, handleSyncToVercel, setDialogToOpen]);

  const fetchVercelProjectTargets = React.useCallback(async () => {
    const isValid = isValidVercelCredentials(formData.vercel_project_id, formData.vercel_token);
    if (!isValid) {
      setDialogToOpen("vercel");
      notify(
        "Por favor, verifica tus credenciales.",
        "error"
      );
      return;
    }
    try {
      setLoadingTargets(true);
      if (!selectedEnvironment?._id || !selectedEnvironment?.slug) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }
      const response = await api.getVercelProjectTargets(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );
      if (response) {
        setTargets(response.targets || []);
      }
    } catch (error) {
      console.error("Error fetching Vercel project targets:", error);
      return;
    } finally {
      setLoadingTargets(false);
    }
  }, [formData, selectedEnvironment, api, notify, setDialogToOpen]);

  const value = React.useMemo(
    () => ({
      loading,
      setLoading,
      formData,
      setFormData,
      mismatches,
      setMismatches,
      targets,
      setTargets,
      loadingTargets,
      setLoadingTargets,
      // Functions
      fetchVercelData,
      handleSubmit,
      handleSyncToVercel,
      handleGetVercelMismatches,
      fetchVercelProjectTargets,
    }),
    [
      loading,
      formData,
      mismatches,
      targets,
      loadingTargets,
      fetchVercelData,
      handleSubmit,
      handleSyncToVercel,
      handleGetVercelMismatches,
      fetchVercelProjectTargets,
    ]
  );

  return (
    <VercelActionsContext.Provider value={value}>
      {children}
    </VercelActionsContext.Provider>
  );
}
