import React from "react";
import { RenderActionsContext } from "@/context";

export function useRenderActions() {
  const {
    loading,
    setLoading,
    formData,
    setFormData,
    // Functions
    fetchRenderData,
    handleSubmit,
    handleSyncToRender,
  } = React.useContext(RenderActionsContext);
  return {
    loading,
    setLoading,
    formData,
    setFormData,
    // Functions
    fetchRenderData,
    handleSubmit,
    handleSyncToRender,
  };
}
