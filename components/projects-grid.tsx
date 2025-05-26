"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderKanban, Users, Folder, User, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import Link from "next/link"
import type { Project } from "@/lib/api"
import { cn } from "@/lib/utils"
// import { motion, AnimatePresence } from "framer-motion"

interface ProjectsGridProps {
  projects: Project[]
  organizationId: string
}

interface GroupedProject {
  name: string
  projects: Project[]
}

export function ProjectsGrid({ projects, organizationId }: ProjectsGridProps) {
  const [viewMode, setViewMode] = useState<"folder" | "team">("folder")
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [allExpanded, setAllExpanded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoizar la función de agrupación para evitar recálculos innecesarios
  const groupProjects = useMemo(() => {
    const groups: Record<string, Project[]> = {}

    projects.forEach((project) => {
      // Asegurarse de que siempre haya un valor para agrupar
      const groupKey = project.tags?.[viewMode] || "Sin clasificar"
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(project)
    })

    // Ordenar los grupos alfabéticamente, pero "Sin clasificar" al final
    const sortedGroups = Object.keys(groups).sort((a, b) => {
      if (a === "Sin clasificar") return 1
      if (b === "Sin clasificar") return -1
      return a.localeCompare(b)
    })

    return sortedGroups.map((groupName) => ({
      name: groupName,
      projects: groups[groupName].sort((a, b) => a.name.localeCompare(b.name)),
    }))
  }, [projects, viewMode]) // Solo recalcular cuando projects o viewMode cambien

  // Inicializar el estado de expansión solo cuando cambia viewMode o allExpanded
  useEffect(() => {
    // Crear un nuevo objeto para el estado de expansión
    const initialExpandedState: Record<string, boolean> = {}

    // Inicializar cada grupo con el valor de allExpanded
    groupProjects.forEach((group) => {
      initialExpandedState[group.name] = allExpanded
    })

    // Actualizar el estado
    setExpandedGroups(initialExpandedState)
    setIsInitialized(true)
  }, [viewMode, allExpanded]) // Solo depende de viewMode y allExpanded

  // Función para alternar la expansión de un grupo
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  // Función para expandir o colapsar todos los grupos
  const toggleAllGroups = () => {
    const newExpandedState = !allExpanded
    setAllExpanded(newExpandedState)
  }

  const ProjectCard = ({ project }: { project: Project }) => (
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
        <Button asChild className="w-full" size="sm">
          <Link href={`/projects/${project._id}`}>Ver Proyecto</Link>
        </Button>
      </CardFooter>
    </Card>
  )

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No tienes acceso a ningún proyecto</h3>
        <p className="text-muted-foreground mb-6">Crea un nuevo proyecto o solicita acceso a proyectos existentes.</p>
      </div>
    )
  }

  // Si aún no se ha inicializado el estado de expansión, mostrar un indicador de carga
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles de vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold">Mis Proyectos</h2>
          <Badge variant="secondary" className="text-sm">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={toggleAllGroups} className="flex items-center gap-1">
            {allExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Colapsar Todos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expandir Todos
              </>
            )}
          </Button>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "folder" | "team")} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="folder" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Por Proyecto
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Por Equipo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Vista agrupada */}
      <div className="space-y-4">
        {groupProjects.map((group) => (
          <div key={`group-${group.name}`} className="border rounded-lg overflow-hidden">
            {/* Encabezado del grupo (siempre visible) */}
            <div
              className={cn(
                "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                expandedGroups[group.name] ? "border-b" : "",
              )}
              onClick={() => toggleGroup(group.name)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {expandedGroups[group.name] ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}

                  {viewMode === "folder" ? (
                    <Folder className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Users className="w-5 h-5 text-muted-foreground" />
                  )}
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                  {group.projects.length} proyecto{group.projects.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroup(group.name)
                }}
              >
                {expandedGroups[group.name] ? "Colapsar" : "Expandir"}
              </Button>
            </div>

            {/* Contenido del grupo (colapsable) */}
            <div>
              {expandedGroups[group.name] && (
                <div
                  // initial={{ height: 0, opacity: 0 }}
                  // animate={{ height: "auto", opacity: 1 }}
                  // exit={{ height: 0, opacity: 0 }}
                  // transition={{ duration: 0.3 }}
                >
                  <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.projects.map((project) => (
                      <ProjectCard key={`project-${project._id}`} project={project} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen al final */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Total: {projects.length} app{projects.length !== 1 ? "s" : ""} en {groupProjects.length}{" "}
            {viewMode === "folder" ? "proyecto" : "equipo"}
            {groupProjects.length !== 1 ? "s" : ""}
          </span>
          <span>Agrupado por {viewMode === "folder" ? "proyecto" : "equipo"}</span>
        </div>
      </div>
    </div>
  )
}
