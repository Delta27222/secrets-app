"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import { useNotify, useProjectEnvironments } from "@/hooks";

interface RenderData {
  render_server_id: string;
  render_token: string;
  environment_id: string;
  project_id: string;
  slug: string;
}

export type TRenderActionsContext = {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formData: RenderData;
  setFormData: React.Dispatch<React.SetStateAction<RenderData>>;
  // Functions
  fetchRenderData: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSyncToRender: (e: React.FormEvent) => Promise<void>;
};
export const RenderActionsContext = React.createContext<TRenderActionsContext>({
  loading: true,
  setLoading: () => {},
  formData: {
    render_server_id: "",
    render_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
  },
  setFormData: () => {},
  // Functions
  fetchRenderData: async () => {},
  handleSubmit: async (e: React.FormEvent) => {
    e.preventDefault();
  },
  handleSyncToRender: async (e: React.FormEvent) => {
    e.preventDefault();
  },
});

type Props = {
  children: React.ReactNode;
};

export function RenderActionsProvider({ children }: Props) {
  const api = useApi();
  const notify = useNotify();

  const { selectedEnvironment, setEnvironmentDetailsOpen, fetchEnvironments } =
    useProjectEnvironments();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<RenderData>({
    render_server_id: "",
    render_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
  });

  const fetchRenderData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (!selectedEnvironment?._id || !selectedEnvironment?.slug) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }

      const data = await api.getRenderInfo(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );

      setFormData({
        project_id: selectedEnvironment.project_id,
        render_server_id: data?.render_server_id || "",
        render_token: data?.render_token || "",
        environment_id: selectedEnvironment._id,
        slug: selectedEnvironment.slug,
      });
    } catch (err) {
      console.error("Error fetching render data:", err);
      notify("Error al cargar los datos de Render.", "error");
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
      if (!formData.render_server_id || !formData.render_token) {
        notify(
          "Por favor, completa el Service Id y el Api Key de Render.",
          "error"
        );
        return;
      }
      const data = await api.updateRenderInfo(
        selectedEnvironment._id,
        formData.render_server_id,
        formData.render_token
      );
      if (data) {
        notify("Datos de Render actualizados.", "success");
        await fetchEnvironments();
        setEnvironmentDetailsOpen(false);
      }
    } catch (err) {
      console.error("Error al sincronizar datos de Render:", err);
      notify("Error al actualizar los datos de Render.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment, formData, api, notify, fetchEnvironments, setEnvironmentDetailsOpen]);

  const handleSyncToRender = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?._id) {
        notify("El entorno seleccionado no es válido.", "error");
        return;
      }
      const data = await api.syncSecretsToRender(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );
      if (data.code === 'success') {
        notify(
          "Secretos sincronizados con Render.",
          "success"
        );
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
      notify("Hubo un error al sincronizar con Render.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment, api, notify]);

  const value = React.useMemo(
    () => ({
      loading,
      setLoading,
      formData,
      setFormData,
      // Functions
      fetchRenderData,
      handleSubmit,
      handleSyncToRender,
    }),
    [
      loading,
      formData,
      fetchRenderData,
      handleSubmit,
      handleSyncToRender,
    ]
  );

  return (
    <RenderActionsContext.Provider value={value}>
      {children}
    </RenderActionsContext.Provider>
  );
}
