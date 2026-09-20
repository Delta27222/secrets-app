"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  PlayCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Clock,
  Eye,
  EyeOff,
  List,
  Search,
  ShieldQuestion,
  UploadCloud,
  Timer,
} from "lucide-react";

const USAGE_SNIPPET = `import { createClient } from "@secrets-27222633/sdk";

const client = createClient({
  token: process.env.TEK_SECRETS_TOKEN,       // tok_...
  environmentId: process.env.TEK_SECRETS_ENVIRONMENT,
});

const secrets = await client.getSecrets();
const apiKey = await client.getSecret("STRIPE_API_KEY");`;

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
      <pre className="whitespace-pre-wrap">{children}</pre>
    </div>
  );
}

function ErrorResult({
  errorType,
  error,
  missingScopes,
}: {
  errorType: string;
  error: string;
  missingScopes?: string[];
}) {
  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{errorType}</AlertTitle>
      <AlertDescription>
        {error}
        {missingScopes && missingScopes.length > 0 && (
          <div className="mt-2 text-xs">
            Scopes faltantes: {missingScopes.join(", ")}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function ResultShell({
  ok,
  meta,
  children,
}: {
  ok: boolean;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ok ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          Resultado
        </CardTitle>
        {meta && (
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {meta}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

type ErrorPayload = {
  ok: false;
  errorType: string;
  error: string;
  missingScopes?: string[];
};

type SecretPreview = { name: string; preview: string; value: string; length: number };
type GetSecretsResult =
  | { ok: true; durationMs: number; environmentId: string; count: number; secrets: SecretPreview[] }
  | ErrorPayload;
type GetSecretResult = { ok: true; durationMs: number; name: string; value: string } | ErrorPayload;
type GetSecretOrDefaultResult =
  | { ok: true; durationMs: number; name: string; value: string | undefined; usedFallback: boolean }
  | ErrorPayload;
type LoadResult =
  | { ok: true; durationMs: number; override: boolean; injected: string[]; alreadyPresent: string[] }
  | ErrorPayload;
type CacheDemoResult = { ok: true; coldMs: number; cachedMs: number; afterClearMs: number } | ErrorPayload;

async function callSdk<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/sdk-demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, errorType: "RequestError", error: data.error ?? "Error en la petición" } as T;
  }
  return data as T;
}

export default function SdkDemoPage() {
  const { data: session } = useSession();
  const [token, setToken] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  // getSecrets
  const [gsLoading, setGsLoading] = useState(false);
  const [gsResult, setGsResult] = useState<GetSecretsResult | null>(null);
  const [showValues, setShowValues] = useState(false);

  // getSecret
  const [secretName, setSecretName] = useState("");
  const [gsecLoading, setGsecLoading] = useState(false);
  const [gsecResult, setGsecResult] = useState<GetSecretResult | null>(null);

  // getSecretOrDefault
  const [defName, setDefName] = useState("");
  const [defFallback, setDefFallback] = useState("");
  const [defLoading, setDefLoading] = useState(false);
  const [defResult, setDefResult] = useState<GetSecretOrDefaultResult | null>(null);

  // load
  const [loadOverride, setLoadOverride] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);
  const [loadResult, setLoadResult] = useState<LoadResult | null>(null);

  // cache / clearCache
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheResult, setCacheResult] = useState<CacheDemoResult | null>(null);

  const creds = { token, environmentId };

  const runGetSecrets = async () => {
    setGsLoading(true);
    setGsResult(null);
    setShowValues(false);
    setGsResult(await callSdk<GetSecretsResult>({ method: "getSecrets", ...creds }));
    setGsLoading(false);
  };

  const runGetSecret = async () => {
    setGsecLoading(true);
    setGsecResult(null);
    setGsecResult(await callSdk<GetSecretResult>({ method: "getSecret", secretName, ...creds }));
    setGsecLoading(false);
  };

  const runGetSecretOrDefault = async () => {
    setDefLoading(true);
    setDefResult(null);
    setDefResult(
      await callSdk<GetSecretOrDefaultResult>({
        method: "getSecretOrDefault",
        secretName: defName,
        fallback: defFallback,
        ...creds,
      }),
    );
    setDefLoading(false);
  };

  const runLoad = async () => {
    setLoadLoading(true);
    setLoadResult(null);
    setLoadResult(await callSdk<LoadResult>({ method: "load", override: loadOverride, ...creds }));
    setLoadLoading(false);
  };

  const runCacheDemo = async () => {
    setCacheLoading(true);
    setCacheResult(null);
    setCacheResult(await callSdk<CacheDemoResult>({ method: "cacheDemo", ...creds }));
    setCacheLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={session?.user} />
      <main className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Tek Secrets SDK (Node.js)</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Demo funcional del SDK oficial para consultar secretos en tiempo de
            ejecución
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              @secrets-27222633/sdk
            </Badge>
            <Badge variant="outline" className="text-sm">
              Node.js &gt;=18
            </Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Uso básico
            </CardTitle>
            <CardDescription>
              Así se consume el SDK dentro de un servicio Node.js
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock>{USAGE_SNIPPET}</CodeBlock>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Credenciales
            </CardTitle>
            <CardDescription>
              Usa un service token de uno de tus proyectos (creado en la sección
              de Tokens de servicio) y su ambiente. Se comparten entre todos los
              métodos de abajo. Si los dejas vacíos, se usa el token de demo
              configurado en el servidor (si existe).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="token">Service Token</Label>
                <Input
                  id="token"
                  placeholder="tok_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="environmentId">Environment ID</Label>
                <Input
                  id="environmentId"
                  placeholder="665f...c1"
                  value={environmentId}
                  onChange={(e) => setEnvironmentId(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="getSecrets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="getSecrets" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              getSecrets
            </TabsTrigger>
            <TabsTrigger value="getSecret" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              getSecret
            </TabsTrigger>
            <TabsTrigger value="getSecretOrDefault" className="flex items-center gap-2">
              <ShieldQuestion className="h-4 w-4" />
              getSecretOrDefault
            </TabsTrigger>
            <TabsTrigger value="load" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              load
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Caché / clearCache
            </TabsTrigger>
          </TabsList>

          {/* getSecrets */}
          <TabsContent value="getSecrets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>client.getSecrets(environmentId?)</CardTitle>
                <CardDescription>
                  Devuelve todas las variables del ambiente como{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    Record&lt;string, string&gt;
                  </code>
                  . Usa caché con TTL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock>{`const secrets = await client.getSecrets();`}</CodeBlock>
                <Button onClick={runGetSecrets} disabled={gsLoading}>
                  {gsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {gsResult && (
              <ResultShell
                ok={gsResult.ok}
                meta={
                  gsResult.ok && (
                    <>
                      {gsResult.count} secretos · {gsResult.durationMs}ms · ambiente{" "}
                      {gsResult.environmentId}
                    </>
                  )
                }
              >
                {gsResult.ok ? (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowValues((p) => !p)}>
                        {showValues ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Ocultar valores
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver valores
                          </>
                        )}
                      </Button>
                    </div>
                    {gsResult.secrets.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Este ambiente no tiene secretos configurados.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {gsResult.secrets.map((secret) => (
                          <div
                            key={secret.name}
                            className="flex items-center justify-between border rounded-lg p-3 text-sm"
                          >
                            <code className="font-mono font-medium">{secret.name}</code>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                {showValues ? secret.value : secret.preview}
                              </code>
                              <span className="text-xs">{secret.length} chars</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <ErrorResult {...gsResult} />
                )}
              </ResultShell>
            )}
          </TabsContent>

          {/* getSecret */}
          <TabsContent value="getSecret" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>client.getSecret(name, environmentId?)</CardTitle>
                <CardDescription>
                  Devuelve el valor de una variable puntual. Lanza{" "}
                  <code className="text-xs bg-muted px-1 rounded">NotFoundError</code> si no
                  existe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock>{`const apiKey = await client.getSecret("STRIPE_API_KEY");`}</CodeBlock>
                <div className="space-y-2">
                  <Label htmlFor="secretName">Nombre de la variable</Label>
                  <Input
                    id="secretName"
                    placeholder="STRIPE_API_KEY"
                    value={secretName}
                    onChange={(e) => setSecretName(e.target.value)}
                  />
                </div>
                <Button onClick={runGetSecret} disabled={gsecLoading || !secretName}>
                  {gsecLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {gsecResult && (
              <ResultShell
                ok={gsecResult.ok}
                meta={gsecResult.ok && <>{gsecResult.durationMs}ms</>}
              >
                {gsecResult.ok ? (
                  <div className="flex items-center justify-between border rounded-lg p-3 text-sm">
                    <code className="font-mono font-medium">{gsecResult.name}</code>
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {gsecResult.value}
                    </code>
                  </div>
                ) : (
                  <ErrorResult {...gsecResult} />
                )}
              </ResultShell>
            )}
          </TabsContent>

          {/* getSecretOrDefault */}
          <TabsContent value="getSecretOrDefault" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>client.getSecretOrDefault(name, fallback?, environmentId?)</CardTitle>
                <CardDescription>
                  Igual que <code className="text-xs bg-muted px-1 rounded">getSecret</code>, pero
                  devuelve el valor por defecto (o <code className="text-xs bg-muted px-1 rounded">undefined</code>)
                  en vez de lanzar un error si la variable no existe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock>{`const value = await client.getSecretOrDefault("FEATURE_FLAG", "false");`}</CodeBlock>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defName">Nombre de la variable</Label>
                    <Input
                      id="defName"
                      placeholder="FEATURE_FLAG"
                      value={defName}
                      onChange={(e) => setDefName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defFallback">Valor por defecto</Label>
                    <Input
                      id="defFallback"
                      placeholder="false"
                      value={defFallback}
                      onChange={(e) => setDefFallback(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={runGetSecretOrDefault} disabled={defLoading || !defName}>
                  {defLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {defResult && (
              <ResultShell
                ok={defResult.ok}
                meta={defResult.ok && <>{defResult.durationMs}ms</>}
              >
                {defResult.ok ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border rounded-lg p-3 text-sm">
                      <code className="font-mono font-medium">{defResult.name}</code>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {defResult.value ?? "undefined"}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {defResult.usedFallback
                        ? "La variable no existía en el ambiente: se usó el valor por defecto."
                        : "La variable existía en el ambiente: se devolvió su valor real."}
                    </p>
                  </div>
                ) : (
                  <ErrorResult {...defResult} />
                )}
              </ResultShell>
            )}
          </TabsContent>

          {/* load */}
          <TabsContent value="load" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>client.load(options?)</CardTitle>
                <CardDescription>
                  Vuelca las variables del ambiente en{" "}
                  <code className="text-xs bg-muted px-1 rounded">process.env</code>. Por defecto
                  no sobreescribe variables ya presentes (<code className="text-xs bg-muted px-1 rounded">override: false</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock>{`await client.load();                     // no sobreescribe
await client.load({ override: true });   // fuerza sobreescritura`}</CodeBlock>
                <div className="flex items-center gap-3">
                  <Switch id="override" checked={loadOverride} onCheckedChange={setLoadOverride} />
                  <Label htmlFor="override">override</Label>
                </div>
                <Button onClick={runLoad} disabled={loadLoading}>
                  {loadLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {loadResult && (
              <ResultShell
                ok={loadResult.ok}
                meta={loadResult.ok && <>{loadResult.durationMs}ms · override: {String(loadResult.override)}</>}
              >
                {loadResult.ok ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-1">Inyectadas en process.env</p>
                      {loadResult.injected.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Ninguna.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {loadResult.injected.map((k) => (
                            <Badge key={k} variant="outline">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Ya existían (no sobreescritas)</p>
                      {loadResult.alreadyPresent.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Ninguna.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {loadResult.alreadyPresent.map((k) => (
                            <Badge key={k} variant="secondary">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ErrorResult {...loadResult} />
                )}
              </ResultShell>
            )}
          </TabsContent>

          {/* cache / clearCache */}
          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Caché en memoria con TTL y client.clearCache()</CardTitle>
                <CardDescription>
                  Cada respuesta de <code className="text-xs bg-muted px-1 rounded">getSecrets</code>{" "}
                  se cachea (30s por defecto). Esta prueba hace 3 llamadas seguidas para comparar
                  tiempos: primera (sin caché), segunda (con caché) y tercera (tras{" "}
                  <code className="text-xs bg-muted px-1 rounded">clearCache()</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock>{`await client.getSecrets();   // 1. sin caché, golpea la API
await client.getSecrets();   // 2. con caché, resuelve local
client.clearCache();
await client.getSecrets();   // 3. caché invalidada, golpea la API de nuevo`}</CodeBlock>
                <Button onClick={runCacheDemo} disabled={cacheLoading}>
                  {cacheLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {cacheResult && (
              <ResultShell ok={cacheResult.ok}>
                {cacheResult.ok ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">1. Sin caché</p>
                      <p className="text-2xl font-bold">{cacheResult.coldMs}ms</p>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">2. Con caché</p>
                      <p className="text-2xl font-bold text-green-600">{cacheResult.cachedMs}ms</p>
                    </div>
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">3. Tras clearCache()</p>
                      <p className="text-2xl font-bold">{cacheResult.afterClearMs}ms</p>
                    </div>
                  </div>
                ) : (
                  <ErrorResult {...cacheResult} />
                )}
              </ResultShell>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
