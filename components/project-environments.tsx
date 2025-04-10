"use client"

import { useState, useEffect, useRef } from "react"
import { useApi } from "@/components/api-provider"
import type { Environment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, Plus, Server, Eye, EyeOff, Copy, Save, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface ProjectEnvironmentsProps {
  projectId: string
}

export function ProjectEnvironments({ projectId }: ProjectEnvironmentsProps) {
  const api = useApi()
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)
  const [showSecrets, setShowSecrets] = useState(false)
  const [environmentDetailsOpen, setEnvironmentDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("view")
  const [envText, setEnvText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [copiedSecrets, setCopiedSecrets] = useState<Record<string, boolean>>({})

  // Referencia para el textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchEnvironments()
  }, [projectId])

  // Efecto para generar el texto .env cuando se selecciona un ambiente
  useEffect(() => {
    if (selectedEnvironment && activeTab === "edit") {
      const envContent = Object.entries(selectedEnvironment.secrets || {})
        .map(([key, value]) => `${key}=${value}`)
        .join("\n")
      setEnvText(envContent)
    }
  }, [selectedEnvironment, activeTab])

  async function fetchEnvironments() {
    try {
      setLoading(true)
      const data = await api.getProjectEnvironments(projectId)
      setEnvironments(data.environments)
    } catch (err) {
      console.error("Error fetching environments:", err)
      setError("No se pudieron cargar los ambientes. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewEnvironment = async (environmentSlug: string) => {
    try {
      const environmentDetails = await api.getEnvironmentDetails(projectId, environmentSlug)
      setSelectedEnvironment(environmentDetails)
      setEnvironmentDetailsOpen(true)
      setShowSecrets(false)
      setActiveTab("view")
      setCopiedSecrets({})
    } catch (err) {
      console.error("Error fetching environment details:", err)
      setError("No se pudieron cargar los detalles del ambiente. Por favor, intenta de nuevo más tarde.")
    }
  }

  const handleCopySecret = (key: string, value: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        // Actualizar el estado para mostrar el ícono de confirmación
        setCopiedSecrets((prev) => ({ ...prev, [key]: true }))

        // Restablecer después de 2 segundos
        setTimeout(() => {
          setCopiedSecrets((prev) => ({ ...prev, [key]: false }))
        }, 2000)

        toast({
          title: "Copiado al portapapeles",
          description: `El valor de ${key} ha sido copiado.`,
        })
      },
      (err) => {
        console.error("No se pudo copiar el texto: ", err)
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el valor al portapapeles.",
          variant: "destructive",
        })
      },
    )
  }

  const handleCopyAllSecrets = () => {
    if (!selectedEnvironment) return

    const allSecrets = Object.entries(selectedEnvironment.secrets || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    navigator.clipboard.writeText(allSecrets).then(
      () => {
        toast({
          title: "Copiado al portapapeles",
          description: "Todas las variables han sido copiadas en formato .env",
        })
      },
      (err) => {
        console.error("No se pudo copiar el texto: ", err)
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar las variables al portapapeles.",
          variant: "destructive",
        })
      },
    )
  }

  const parseEnvText = (text: string): Record<string, string> => {
    const secrets: Record<string, string> = {}

    // Dividir por líneas y procesar cada una
    text.split("\n").forEach((line) => {
      // Ignorar líneas vacías o comentarios
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith("#")) return

      // Buscar el primer signo igual que no esté escapado
      const equalIndex = trimmedLine.indexOf("=")
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim()
        let value = trimmedLine.substring(equalIndex + 1).trim()

        // Eliminar comillas si están presentes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1)
        }

        secrets[key] = value
      }
    })

    return secrets
  }

  const handleSaveEnvironment = async () => {
    if (!selectedEnvironment) return

    try {
      setIsSaving(true)

      // Parsear el texto .env a un objeto de secretos
      const secrets = parseEnvText(envText)

      // Preparar los datos para la actualización
      const updateData = {
        name: selectedEnvironment.name,
        slug: selectedEnvironment.slug,
        secrets: secrets,
      }

      // Llamar a la API para actualizar
      await api.updateEnvironment(selectedEnvironment._id, updateData)

      // Actualizar el ambiente seleccionado con los nuevos secretos
      setSelectedEnvironment({
        ...selectedEnvironment,
        secrets: secrets,
      })

      // Refrescar la lista de ambientes
      fetchEnvironments()

      // Cambiar a la pestaña de visualización
      setActiveTab("view")

      toast({
        title: "Ambiente actualizado",
        description: "Las variables de entorno han sido actualizadas correctamente.",
      })
    } catch (err) {
      console.error("Error updating environment:", err)
      toast({
        title: "Error al actualizar",
        description: "No se pudieron actualizar las variables de entorno.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getEnvironmentBadge = (slug: string) => {
    switch (slug) {
      case "prod":
        return <Badge className="bg-green-500">{slug}</Badge>
      case "stg":
        return <Badge className="bg-blue-500">{slug}</Badge>
      case "dev":
        return <Badge className="bg-amber-500">{slug}</Badge>
      default:
        return <Badge>{slug}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando ambientes...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Ambientes del Proyecto</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ambiente
        </Button>
      </div>

      {environments.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No hay ambientes configurados</h3>
          <p className="text-muted-foreground mb-6">
            Crea un nuevo ambiente para comenzar a gestionar variables de entorno.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Crear Ambiente
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((environment) => (
            <Card key={environment._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{environment.name}</CardTitle>
                  {getEnvironmentBadge(environment.slug)}
                </div>
                <CardDescription>
                  {environment._id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Server className="mr-2 h-4 w-4" />
                  <span>
                    {Object.keys(environment.secrets || {}).length} variable
                    {Object.keys(environment.secrets || {}).length !== 1 ? "s" : ""} configurada
                    {Object.keys(environment.secrets || {}).length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => handleViewEnvironment(environment.slug)}>
                  Ver Detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={environmentDetailsOpen} onOpenChange={setEnvironmentDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEnvironment?.name} {selectedEnvironment && getEnvironmentBadge(selectedEnvironment.slug)}
            </DialogTitle>
            <DialogDescription>Variables de entorno configuradas para este ambiente.</DialogDescription>
          </DialogHeader>

          {selectedEnvironment && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">Ver Variables</TabsTrigger>
                <TabsTrigger value="edit">Editar Variables</TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Variables de Entorno</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleCopyAllSecrets}
                    >
                      <Copy className="h-4 w-4" /> Copiar Todo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? (
                        <>
                          <EyeOff className="h-4 w-4" /> Ocultar Valores
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" /> Mostrar Valores
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {Object.keys(selectedEnvironment.secrets || {}).length === 0 ? (
                  <div className="text-center py-6 bg-muted rounded-md">
                    <p className="text-muted-foreground">No hay variables configuradas en este ambiente.</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm text-muted-foreground border-b">
                      <div className="col-span-5">Nombre</div>
                      <div className="col-span-6">Valor</div>
                      <div className="col-span-1">Acción</div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {Object.entries(selectedEnvironment.secrets || {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-12 gap-4 p-3 border-b last:border-0 items-center">
                          <div className="col-span-5 font-mono text-sm truncate" title={key}>
                            {key}
                          </div>
                          <div className="col-span-6 font-mono text-sm truncate">
                            {showSecrets ? (
                              <span className="break-all" title={value}>
                                {value}
                              </span>
                            ) : (
                              <span>••••••••••••••••</span>
                            )}
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopySecret(key, value)}
                              title="Copiar valor"
                            >
                              {copiedSecrets[key] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="edit">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Editar Variables en formato .env</h4>
                  </div>

                  <div className="bg-muted p-2 rounded-md text-xs text-muted-foreground">
                    <p>Formato: KEY=VALUE (una variable por línea)</p>
                    <p>Ejemplo: DATABASE_URL=postgres://user:pass@localhost:5432/db</p>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    value={envText}
                    onChange={(e) => setEnvText(e.target.value)}
                    className="font-mono text-sm h-80"
                    placeholder="KEY=value"
                  />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveEnvironment} disabled={isSaving} className="flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setEnvironmentDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
