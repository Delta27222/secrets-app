"use client";
import React from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectEnvironments, useVercelActions } from "@/hooks";
import { Label } from "@/components/ui/label";

export function VercelSyncForm() {
  const didFetchRef = React.useRef(false);
  const {
    loading,
    formData,
    setFormData,
    fetchVercelData,
    handleSubmit,
  } = useVercelActions();
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
    fetchVercelData();
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
        <div className="flex flex-col justify-center items-start w-full gap-2">
          <Label htmlFor="name">Vercel Token</Label>
          <Input
            name="vercel_token"
            value={formData.vercel_token}
            onChange={handleChange}
            placeholder="Ingrese el Vercel Api Key"
          />
        </div>
        <div className="flex flex-col justify-center items-start w-full gap-2">
          <Label htmlFor="name">ID de Proyecto</Label>
          <Input
            name="vercel_project_id"
            value={formData.vercel_project_id}
            onChange={handleChange}
            placeholder="Ingrese el Project ID del proyecto en Vercel"
          />
        </div>

        <Button type="submit">
          <Save className="h-4 w-4" />
          Actualizar valores
        </Button>
      </div>
    </form>
  );
}
