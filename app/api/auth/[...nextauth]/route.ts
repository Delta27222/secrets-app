import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFETCH_INTERVAL_SECONDS,
  encodeAbsoluteSession,
  ensureSessionStartedAt,
  getSessionExpiresAtUnix,
  isSessionExpired,
} from "@/lib/auth-session-config"

// Este es el flujo OAuth completo:
// 1. Usuario hace clic en "Iniciar sesión con GitHub"
// 2. Se redirige a GitHub para autorización
// 3. GitHub redirige de vuelta con un código
// 4. NextAuth intercambia el código por un token de acceso
// 5. NextAuth almacena el token y crea una sesión
// 6. Hacemos una llamada a nuestra API para obtener los datos del usuario

const isDev = process.env.NODE_ENV === "development"

function logAuthDebug(
  label: string,
  details: Record<string, string | number | boolean | undefined>,
) {
  if (!isDev) return
  console.log(`[NextAuth] ${label}`, details)
}

function tokenExpiryDetails(token: Record<string, unknown>) {
  const startedAt = token.sessionStartedAt
  const absoluteExp =
    typeof startedAt === "number" ? startedAt + SESSION_MAX_AGE_SECONDS : undefined
  const now = Math.floor(Date.now() / 1000)
  const secondsLeft = absoluteExp != null ? absoluteExp - now : undefined
  return {
    maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
    sessionStartedAt:
      typeof startedAt === "number"
        ? new Date(startedAt * 1000).toISOString()
        : undefined,
    absoluteExpiresAt: absoluteExp
      ? new Date(absoluteExp * 1000).toISOString()
      : undefined,
    secondsUntilExpiry: secondsLeft,
    isExpired: absoluteExp != null ? absoluteExp < now : undefined,
    refetchIntervalSeconds: SESSION_REFETCH_INTERVAL_SECONDS,
  }
}

// Obtener la URL base para la autenticación
const baseUrl = process.env.NEXTAUTH_URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tek-secrets.onrender.com"

if (!baseUrl && process.env.NODE_ENV === "production") {
  console.warn("ADVERTENCIA: No se ha configurado NEXTAUTH_URL o VERCEL_URL en el entorno de producción.")
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    // Con JWT, updateAge no evita el refresh rodante; la exp fija va en encodeAbsoluteSession
    updateAge: SESSION_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
    encode: encodeAbsoluteSession,
  },
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) return true

      try {
        const response = await fetch(`${apiUrl}/v1/auth/github`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-GitHub-Token": `${account.access_token}`,
          },
        })

        if (response.status === 403) {
          const errorData = await response.json()
          console.log("❌ Usuario NO pertenece a la organización:", errorData.detail)
          return "/auth/signin?error=not_org_member"
        }

        if (response.ok) {
          console.log("✅ Usuario pertenece a la organización")
          // Store user data temporarily for jwt callback
          ;(account as Record<string, unknown>).__userData = await response.json()
        }
      } catch (error) {
        console.error("Error validando organización:", error)
      }

      return true
    },
    async jwt({ token, account, profile }) {
      if (isSessionExpired(token)) {
        logAuthDebug("jwt: sesión expirada (no se renueva)", {
          email: token.email as string | undefined,
          ...tokenExpiryDetails(token),
        })
        throw new Error("SESSION_EXPIRED")
      }

      token = ensureSessionStartedAt(token, !!(account && profile))

      // Cuando se completa la autenticación inicial, 'account' contiene el token de acceso
      if (account && profile) {
        // Guardamos el token de acceso en el JWT
        token.accessToken = account.access_token
        token.tokenType = account.token_type

        // User data already fetched in signIn callback
        const userData = (account as Record<string, unknown>).__userData as Record<string, string> | undefined
        if (userData) {
          token.id = userData._id
          token.username = userData.username
          token.displayName = userData.displayName
          token.email = userData.email || token.email
        }

        logAuthDebug("jwt: login (nueva sesión)", {
          email: token.email as string | undefined,
          ...tokenExpiryDetails(token),
        })
      } else if (isDev) {
        logAuthDebug("jwt: refresh (exp absoluta, sin extender)", {
          email: token.email as string | undefined,
          absoluteExpiresUnix: getSessionExpiresAtUnix(token),
          ...tokenExpiryDetails(token),
        })
      }

      return token
    },
    async session({ session, token }) {
      const absoluteExp = getSessionExpiresAtUnix(token)
      if (absoluteExp != null) {
        session.expires = new Date(absoluteExp * 1000).toISOString()
      }

      // Pasamos el token de acceso y los datos del usuario a la sesión del cliente
      session.accessToken = token.accessToken
      session.tokenType = token.tokenType

      // Añadir los datos del usuario a la sesión
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
        displayName: token.displayName,
      }

      logAuthDebug("session: enviada al cliente", {
        email: session.user?.email ?? undefined,
        sessionExpires: session.expires,
        ...tokenExpiryDetails(token),
      })

      return session
    },
    async redirect({ url, baseUrl }) {
      // Asegurarnos de que las redirecciones internas vayan al dominio correcto
      if (url.startsWith("/")) {
        // Para rutas relativas, usar la URL base
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        // Para URLs absolutas del mismo origen, permitirlas
        return url
      }
      // Para otras URLs, redirigir a la página principal
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
