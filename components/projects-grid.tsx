"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderKanban, Users, Folder, User, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ProjectCard } from "@/components/project-card"

interface ProjectsGridProps {
  projects: Project[]
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [viewMode, setViewMode] = React.useState<"folder" | "team">("folder")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})
  const [allExpanded, setAllExpanded] = React.useState<boolean>(false)
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false)

  // Memoizar la función de agrupación para evitar recálculos innecesarios
  const groupProjects = React.useMemo(() => {
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
  React.useEffect(() => {
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
