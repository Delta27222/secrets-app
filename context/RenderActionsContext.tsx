"use client";

import React from "react";
import { useApi } from "@/components/api-provider";
import { Environment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { parseEnvText } from "@/utils/parseEnvText";
import { useParams } from "next/navigation";
import { useProjectEnvironments } from "@/hooks";

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
  const { setError, selectedEnvironment } = useProjectEnvironments();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<RenderData>({
    render_server_id: "",
    render_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
  });

  async function fetchRenderData() {
    try {
      setLoading(true);
      if (!selectedEnvironment?._id || !selectedEnvironment?.slug) {
        setError(
          "El entorno seleccionado no es válido. Por favor, selecciona un entorno válido."
        );
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
      setError(
        "No se pudieron cargar los datos de Render. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?._id) {
        setError(
          "El entorno seleccionado no es válido. Por favor, selecciona un entorno válido."
        );
        return;
      }
      if (!formData.render_server_id || !formData.render_token) {
        setError("Por favor, completa el Service Id y el Api Key de Render.");
        return;
      }
      const data = await api.updateRenderInfo(
        selectedEnvironment._id,
        formData.render_server_id,
        formData.render_token
      );
      if (data) {
        toast({
          title: "Sincronización exitosa",
          description: "Los datos de Render se han actualizado correctamente.",
        });
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
      setError("Hubo un error al actualizar los datos de Render.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncToRender(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (!selectedEnvironment?._id) {
        setError(
          "El entorno seleccionado no es válido. Por favor, selecciona un entorno válido."
        );
        return;
      }
      const data = await api.syncSecretsToRender(
        selectedEnvironment.project_id,
        selectedEnvironment.slug
      );
      if (data.status_code === 200) {
        toast({
          title: "Sincronización exitosa",
          description: "Los nuevos secretos se han sincronizado con Render.",
        });
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
      setError("Hubo un error al sincronizar con Render.");
    } finally {
      setLoading(false);
    }
  }

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
      setLoading,
      formData,
      setFormData,
      // Functions
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
