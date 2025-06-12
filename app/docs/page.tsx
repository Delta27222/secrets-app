"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Terminal,
  Download,
  Code,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Github,
  User,
  LogOut,
  FolderKanban,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

export default function DocsPage() {
  const { data: session } = useSession()
  const [copiedCommands, setCopiedCommands] = useState<Record<string, boolean>>({})

  const copyToClipboard = (text: string, commandId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommands((prev) => ({ ...prev, [commandId]: true }))
      setTimeout(() => {
        setCopiedCommands((prev) => ({ ...prev, [commandId]: false }))
      }, 2000)
      toast({
        title: "Copiado al portapapeles",
        description: "El comando ha sido copiado correctamente.",
      })
    })
  }

  const CodeBlock = ({ children, commandId }: { children: string; commandId?: string }) => (
    <div className="relative bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
      <pre className="whitespace-pre-wrap">{children}</pre>
      {commandId && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
          onClick={() => copyToClipboard(children, commandId)}
        >
          {copiedCommands[commandId] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )

  const commands = [
    {
      name: "login",
      icon: <Github className="h-4 w-4" />,
      description: "Authenticate with GitHub and authorize against Tek Secrets",
      usage: "tek-secrets login",
      example: "tek-secrets login\n🔐 Authentication Flow with GitHub\n⏳ Loading... \n✅ User authenticated: Welcome, lesanpi!",
    },
    {
      name: "user",
      icon: <User className="h-4 w-4" />,
      description: "Retrieve and display information about the authenticated user",
      usage: "tek-secrets user",
      example: `tek-secrets user
ℹ️ User Information:
* email: lespinerua@gmail.com
* username: lesanpi
* displayName: Luis Sánchez P.
* createdAt: None
* updatedAt: None
* _id: 67929fdf8a444d0d737efa67`,
    },
    {
      name: "logout",
      icon: <LogOut className="h-4 w-4" />,
      description: "Terminate the current authenticated session",
      usage: "tek-secrets logout",
      example: `tek-secrets logout
🔒 Successfully logged out.`,
    },
    {
      name: "projects list",
      icon: <FolderKanban className="h-4 w-4" />,
      description: "List the projects you have access to. The CLI will ask you which organization if not specified.",
      usage: "tek-secrets projects list [OPTIONS]",
      example: `tek-secrets projects list --org [OPTIONAL ORGNIZATION ID]
[?] 🏤 Select organization::
 > Avila Tek

✅ Proyectos encontrados:
* Tek Secrets API`,
    },
    {
      name: "env",
      icon: <Settings className="h-4 w-4" />,
      description: "Manage environment variables and secrets",
      usage: "tek-secrets env [OPTIONS] COMMAND [ARGS]",
      example: "tek-secrets env get --project my-project --env production",
      subcommands: [
        {
          name: "get",
          description: "Retrieve secrets for a specific project environment",
          usage: "tek-secrets env get",
          example: "tek-secrets env get -p my-project -e production",
          options: [
            { name: "-o, --org TEXT", description: "Organization ID" },
            { name: "-p, --project TEXT", description: "Project ID" },
            { name: "-e, --env TEXT", description: "Project environment" },
            { name: "--output-env FILE", description: "Path to save the environment variables" },
            { name: "--help", description: "Show this message and exit" },
          ],
          details:
            "Requires authenticated session. If IDs not provided, interactively prompts for selection. Displays environment variables in readable format.",
        },
        {
          name: "update",
          description: "Update environment secrets using values from a .env file",
          usage: "tek-secrets env update",
          example: "tek-secrets env update --env-file .env -p my-project -e staging",
          options: [
            { name: "--env-file FILE", description: "Path to .env file containing updated secrets [required]" },
            { name: "-e, --env TEXT", description: "Project environment slug [dev, stg, prod]" },
            { name: "-o, --org TEXT", description: "Organization ID" },
            { name: "-p, --project TEXT", description: "Project ID" },
            { name: "--env-id TEXT", description: "Environment ID (use when slug is not specified)" },
            { name: "--help", description: "Show this message and exit" },
          ],
          details:
            "Requires authenticated session. Parses provided .env file into key-value pairs. Updates specified environment with new secrets. Supports both interactive selection and direct ID specification.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user} />
      <main className="container mx-auto py-10 px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Terminal className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Tek Secrets CLI</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Herramienta de línea de comandos para gestionar secretos y variables de entorno
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Versión 0.1.4.dev0
            </Badge>
            <Badge variant="outline" className="text-sm">
              Python &gt;=4.0, &gt;=3.11
            </Badge>
            <Badge variant="outline" className="text-sm">
              MIT License
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="installation" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="installation" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Instalación
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Uso Básico
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Comandos
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Ejemplos
            </TabsTrigger>
            <TabsTrigger value="reference" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Referencia
            </TabsTrigger>
          </TabsList>

          {/* Installation Tab */}
          <TabsContent value="installation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Instalación
                </CardTitle>
                <CardDescription>Instala tek-secrets usando pip, el gestor de paquetes de Python</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Instalación desde PyPI</h4>
                  <CodeBlock commandId="install">pip install tek-secrets</CodeBlock>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Verificar instalación</h4>
                  <CodeBlock commandId="version">tek-secrets --help</CodeBlock>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Requisitos del sistema</h4>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Python 3.11 o superior</li>
                    <li>• pip (incluido con Python)</li>
                    <li>• Conexión a internet para autenticación</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Uso Básico
                </CardTitle>
                <CardDescription>Sintaxis general y opciones disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Sintaxis general</h4>
                  <CodeBlock commandId="syntax">$ tek-secrets [OPTIONS] COMMAND [ARGS]...</CodeBlock>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Opciones globales</h4>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">--help</code>
                      <p className="text-sm text-muted-foreground mt-1">Muestra este mensaje de ayuda y sale</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Primer uso</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Antes de usar tek-secrets, necesitas autenticarte con GitHub:
                    </p>
                    <CodeBlock commandId="first-login">tek-secrets login</CodeBlock>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
            <div className="grid gap-6">
              {commands.map((command) => (
                <Card key={command.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {command.icon}
                      {command.name}
                    </CardTitle>
                    <CardDescription>{command.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">Uso</h5>
                      <CodeBlock commandId={`usage-${command.name}`}>{command.usage}</CodeBlock>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Ejemplo</h5>
                      <CodeBlock commandId={`example-${command.name}`}>{command.example}</CodeBlock>
                    </div>
                    {command.subcommands && (
                      <div className="mt-6">
                        <h5 className="font-medium mb-3">Subcommands</h5>
                        <div className="space-y-6">
                          {command.subcommands.map((subcommand) => (
                            <div key={`${command.name}-${subcommand.name}`} className="border rounded-lg p-4">
                              <h6 className="font-semibold text-lg mb-2">
                                {command.name} {subcommand.name}
                              </h6>
                              <p className="text-sm text-muted-foreground mb-3">{subcommand.description}</p>

                              <div className="mb-3">
                                <h6 className="font-medium text-sm mb-1">Usage</h6>
                                <CodeBlock commandId={`usage-${command.name}-${subcommand.name}`}>
                                  {subcommand.usage}
                                </CodeBlock>
                              </div>

                              <div className="mb-3">
                                <h6 className="font-medium text-sm mb-1">Example</h6>
                                <CodeBlock commandId={`example-${command.name}-${subcommand.name}`}>
                                  {subcommand.example}
                                </CodeBlock>
                              </div>

                              {subcommand.details && (
                                <div className="mb-3">
                                  <h6 className="font-medium text-sm mb-1">Details</h6>
                                  <p className="text-sm text-muted-foreground">{subcommand.details}</p>
                                </div>
                              )}

                              {subcommand.options && (
                                <div>
                                  <h6 className="font-medium text-sm mb-1">Options</h6>
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <ul className="space-y-1 text-sm">
                                      {subcommand.options.map((option, idx) => (
                                        <li key={idx} className="flex">
                                          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded mr-2 min-w-[140px]">
                                            {option.name}
                                          </code>
                                          <span className="text-muted-foreground">{option.description}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Typical Workflow
                </CardTitle>
                <CardDescription>Step-by-step example of how to use tek-secrets in your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">1. Initial Authentication</h4>
                  <CodeBlock commandId="workflow-1">tek-secrets login</CodeBlock>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will open your browser to authenticate with GitHub
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">2. Verify your user</h4>
                  <CodeBlock commandId="workflow-2">tek-secrets user</CodeBlock>
                  <p className="text-sm text-muted-foreground mt-2">Confirm that you're properly authenticated</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">3. List available projects</h4>
                  <CodeBlock commandId="workflow-3">tek-secrets projects</CodeBlock>
                  <p className="text-sm text-muted-foreground mt-2">View all projects you have access to</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">4. Working with environment variables</h4>
                  <CodeBlock commandId="workflow-4">{`# Get environment variables from a specific environment
tek-secrets env get -p my-project -e production

# Save environment variables to a file
tek-secrets env get -p my-project -e production --output-env .env.production

# Update environment variables from a local file
tek-secrets env update --env-file .env.staging -p my-project -e staging`}</CodeBlock>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sync variables between your local environment and remote environments
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">5. Log out (optional)</h4>
                  <CodeBlock commandId="workflow-5">tek-secrets logout</CodeBlock>
                  <p className="text-sm text-muted-foreground mt-2">End your authenticated session when you're done</p>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Reference Tab */}
          <TabsContent value="reference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Referencia completa
                </CardTitle>
                <CardDescription>Información detallada sobre el paquete y recursos adicionales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Información del paquete</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versión:</span>
                        <span>0.1.4.dev0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Licencia:</span>
                        <span>MIT License</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Python:</span>
                        <span>{'>=4.0, >=3.11'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Autor:</span>
                        <span>lesanpi</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Enlaces útiles</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="https://pypi.org/project/tek-secrets/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          PyPI Package
                        </a>
                      </Button>
                      {/* <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="https://github.com/lesanpi/tek-secrets" target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Código fuente
                        </a>
                      </Button> */}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Nota importante</h4>
                  <p className="text-amber-800 text-sm">
                    Esta es una versión de desarrollo (dev0). Algunas funcionalidades pueden cambiar en versiones
                    futuras. Para uso en producción, se recomienda esperar a una versión estable.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
