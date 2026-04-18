import React from "react";
import { VercelActionsContext } from "@/context";

export function useVercelActions() {
  const {
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
  } = React.useContext(VercelActionsContext);
  return {
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
  };
}
