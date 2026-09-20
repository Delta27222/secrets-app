import React from "react";
import { ProjectsInfoContext } from "@/context/ProjectsInfoContext";

export function useProjectsInfo() {
  const {
    loading,
    setLoading,
    loadingProjectMembers,
    setLoadingProjectMembers,
    error,
    setError,
    project,
    setProject,
    userProjectRole,
    setUserProjectRole,
    userOrgRole,
    setUserOrgRole,
    projectMembers,
    setProjectMembers,

    //Functions
    fetchProject,
    fetchProjectMembers,
  } = React.useContext(ProjectsInfoContext);
  return {
    loading,
    setLoading,
    loadingProjectMembers,
    setLoadingProjectMembers,
    error,
    setError,
    project,
    setProject,
    userProjectRole,
    setUserProjectRole,
    userOrgRole,
    setUserOrgRole,
    projectMembers,
    setProjectMembers,

    //Functions
    fetchProject,
    fetchProjectMembers,
  };
}
