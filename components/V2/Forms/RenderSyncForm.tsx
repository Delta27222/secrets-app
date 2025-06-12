"use client";
import React from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectEnvironments, useRenderActions } from "@/hooks";

export function RenderSyncForm() {
  const didFetchRef = React.useRef(false);
  const { loading, formData, setFormData, fetchRenderData, handleSubmit } =
    useRenderActions();
  const { selectedEnvironment } = useProjectEnvironments();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  React.useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchRenderData();
  }, [selectedEnvironment]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

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
        <Button type="submit">
          <Save className="h-4 w-4" />
          Actualizar valores
        </Button>
      </div>
    </form>
  );
}
