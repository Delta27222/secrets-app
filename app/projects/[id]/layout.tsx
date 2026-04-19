import React from "react";
import {
  ProjectEnvironmentsProvider,
  RenderActionsProvider,
  VercelActionsProvider,
} from "@/context";

type Props = {
  children: React.ReactNode;
};

export default function ProjectLayout({ children }: Props) {
  return (
    <ProjectEnvironmentsProvider>
      <RenderActionsProvider>
        <VercelActionsProvider>{children}</VercelActionsProvider>
      </RenderActionsProvider>
    </ProjectEnvironmentsProvider>
  );
}
