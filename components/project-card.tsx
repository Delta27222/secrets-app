"use client"

import React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Folder, Loader2, Users } from "lucide-react"
import type { Project } from "@/lib/api"

interface ProjectCardProps {
  project: Project
  /** Cuando no es null, ningún botón "Ver Proyecto" debe aceptar otro clic */
  navigatingProjectId: string | null
  onOpenProject: (projectId: string) => void
}

export function ProjectCard({ project, navigatingProjectId, onOpenProject }: ProjectCardProps) {
  const navigationLocked = navigatingProjectId !== null
  const thisNavigating = navigatingProjectId === project._id
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{project.name}</CardTitle>
        {/* <CardDescription className="text-sm line-clamp-2">{project.description || "Sin descripción"}</CardDescription> */}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* Tags principales */}
          <div className="flex flex-wrap gap-1">
            {project.tags?.folder && (
              <Badge key="folder-tag" variant="outline" className="text-xs">
                <Folder className="w-3 h-3 mr-1" />
                {project.tags.folder}
              </Badge>
            )}
            {project.tags?.team && (
              <Badge key="team-tag" variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {project.tags.team}
              </Badge>
            )}
          </div>

          {/* Tags adicionales */}
          {project.tags && Object.keys(project.tags).filter((key) => key !== "folder" && key !== "team").length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(project.tags)
                .filter(([key]) => key !== "folder" && key !== "team")
                .slice(0, 3)
                .map(([key, value]) => (
                  <Badge key={`tag-${key}`} variant="secondary" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              {Object.keys(project.tags).filter((key) => key !== "folder" && key !== "team").length > 3 && (
                <Badge key="more-tags" variant="secondary" className="text-xs">
                  +{Object.keys(project.tags).filter((key) => key !== "folder" && key !== "team").length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          type="button"
          className="w-full"
          size="sm"
          disabled={navigationLocked}
          onClick={() => onOpenProject(project._id)}
        >
          {thisNavigating ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Cargando…
            </>
          ) : (
            "Ver Proyecto"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
