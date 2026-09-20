import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { createClient, TekSecretsError } from "@secrets-27222633/sdk"

type Body = {
  method?: "getSecrets" | "getSecret" | "getSecretOrDefault" | "load" | "cacheDemo"
  token?: string
  environmentId?: string
  secretName?: string
  fallback?: string
  override?: boolean
}

export async function POST(request: NextRequest) {
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body: Body = await request.json().catch(() => ({}))
  const method = body.method ?? "getSecrets"
  const token = body.token?.trim() || process.env.TEK_SECRETS_TOKEN
  const environmentId = body.environmentId?.trim() || process.env.TEK_SECRETS_ENVIRONMENT

  if (!token || !environmentId) {
    return NextResponse.json(
      { error: "Falta 'token' o 'environmentId' (service token del proyecto y ambiente)" },
      { status: 400 },
    )
  }

  const client = createClient({
    token,
    environmentId,
    baseUrl: process.env.TEK_SECRETS_API_URL,
  })

  try {
    switch (method) {
      case "getSecrets": {
        const startedAt = Date.now()
        const secrets = await client.getSecrets()
        const durationMs = Date.now() - startedAt
        const keys = Object.entries(secrets).map(([name, value]) => ({
          name,
          preview: maskValue(value),
          value,
          length: value.length,
        }))
        return NextResponse.json({
          ok: true,
          method,
          durationMs,
          environmentId,
          count: keys.length,
          secrets: keys,
        })
      }

      case "getSecret": {
        const name = body.secretName?.trim()
        if (!name) {
          return NextResponse.json({ error: "Falta 'secretName'" }, { status: 400 })
        }
        const startedAt = Date.now()
        const value = await client.getSecret(name)
        const durationMs = Date.now() - startedAt
        return NextResponse.json({ ok: true, method, durationMs, name, value })
      }

      case "getSecretOrDefault": {
        const name = body.secretName?.trim()
        if (!name) {
          return NextResponse.json({ error: "Falta 'secretName'" }, { status: 400 })
        }
        const startedAt = Date.now()
        const value = await client.getSecretOrDefault(name, body.fallback)
        const durationMs = Date.now() - startedAt
        return NextResponse.json({
          ok: true,
          method,
          durationMs,
          name,
          value,
          usedFallback: value === body.fallback,
        })
      }

      case "load": {
        const before = new Set(Object.keys(process.env))
        const startedAt = Date.now()
        const secrets = await client.load({ override: body.override ?? false })
        const durationMs = Date.now() - startedAt
        const injected: string[] = []
        const alreadyPresent: string[] = []
        for (const key of Object.keys(secrets)) {
          if (before.has(key) && !body.override) alreadyPresent.push(key)
          else injected.push(key)
        }
        return NextResponse.json({
          ok: true,
          method,
          durationMs,
          override: body.override ?? false,
          injected,
          alreadyPresent,
        })
      }

      case "cacheDemo": {
        const t0 = Date.now()
        await client.getSecrets()
        const coldMs = Date.now() - t0

        const t1 = Date.now()
        await client.getSecrets()
        const cachedMs = Date.now() - t1

        client.clearCache()

        const t2 = Date.now()
        await client.getSecrets()
        const afterClearMs = Date.now() - t2

        return NextResponse.json({
          ok: true,
          method,
          coldMs,
          cachedMs,
          afterClearMs,
        })
      }

      default:
        return NextResponse.json({ error: `Método desconocido: ${method}` }, { status: 400 })
    }
  } catch (err) {
    if (err instanceof TekSecretsError) {
      return NextResponse.json(
        {
          ok: false,
          method,
          errorType: err.name,
          error: err.message,
          missingScopes: (err as any).missingScopes,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        ok: false,
        method,
        errorType: "UnknownError",
        error: err instanceof Error ? err.message : "Error desconocido",
      },
      { status: 200 },
    )
  }
}

function maskValue(value: string) {
  if (value.length <= 4) return "•".repeat(value.length)
  return `${value.slice(0, 2)}${"•".repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`
}
