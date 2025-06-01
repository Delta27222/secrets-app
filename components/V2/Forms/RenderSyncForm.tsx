"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectEnvironments } from "@/hooks";
import { useApi } from "@/components/api-provider";
import { toast } from "@/hooks/use-toast";
import { UploadIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RenderData {
  render_server_id: string;
  render_token: string;
  environment_id: string;
  project_id: string;
  slug: string;
}

export function RenderSyncForm() {
  const api = useApi();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<RenderData>({
    render_server_id: "",
    render_token: "",
    environment_id: "",
    project_id: "",
    slug: "",
  });

  const { setError, selectedEnvironment } = useProjectEnvironments();
  const didFetchRef = React.useRef(false);

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

  React.useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchRenderData();
  }, [selectedEnvironment]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        selectedEnvironment.slug,
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


  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  const showButtonToSync =
    formData.render_server_id !== "" && formData.render_token !== "";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col items-center space-y-5">
        <Input
          name="render_token"
          value={formData.render_token}
          onChange={handleChange}
          placeholder="Ingrese el Render Api Key"
        />
        <Input
          name="render_server_id"
          value={formData.render_server_id}
          onChange={handleChange}
          placeholder="Ingrese el Service Id del proyecto"
        />
        <div className={`flex ${showButtonToSync ? 'justify-between' : 'justify-end'} w-full space-x-3`}>
          {showButtonToSync ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleSyncToRender}
                  >
                    <UploadIcon className="size-4 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sincronizar secretos con Render</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Button variant="outline" type="submit">
            Actualizar valores
          </Button>
        </div>
      </div>
    </form>
  );
}
