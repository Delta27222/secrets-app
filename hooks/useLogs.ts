import React from "react";
import { LogsContext } from "@/context/LogsContext";

export function useLogs() {
  const {
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
  } = React.useContext(LogsContext);
  return {
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
  };
}
