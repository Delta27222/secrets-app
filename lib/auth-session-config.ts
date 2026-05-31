import { EncryptJWT } from "jose"
import hkdf from "@panva/hkdf"
import { v4 as uuid } from "uuid"
import type { JWT } from "next-auth/jwt"
import type { JWTEncodeParams } from "next-auth/jwt"

/** Duración fija de sesión en segundos. Pruebas: 60 (1 min). Producción: 15 * 60 (15 min) */
export const SESSION_MAX_AGE_SECONDS = 15 * 60

/**
 * NextAuth con JWT renueva el token en cada GET /api/auth/session (sesión rodante).
 * updateAge solo aplica a estrategia "database"; con JWT hay que fijar exp absoluto.
 */
export const SESSION_STARTED_AT_KEY = "sessionStartedAt"

/** Poll del cliente: ~4 veces dentro del maxAge para detectar expiración pronto */
export const SESSION_REFETCH_INTERVAL_SECONDS = Math.max(
  5,
  Math.floor(SESSION_MAX_AGE_SECONDS / 4),
)

async function getDerivedEncryptionKey(keyMaterial: string, salt: string) {
  return hkdf(
    "sha256",
    keyMaterial,
    salt,
    `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`,
    32,
  )
}

export function getSessionExpiresAtUnix(token: JWT): number | undefined {
  const started = token[SESSION_STARTED_AT_KEY]
  if (typeof started !== "number") return undefined
  return started + SESSION_MAX_AGE_SECONDS
}

export function isSessionExpired(token: JWT): boolean {
  const expiresAt = getSessionExpiresAtUnix(token)
  if (expiresAt == null) return false
  return Math.floor(Date.now() / 1000) >= expiresAt
}

export function ensureSessionStartedAt(token: JWT, accountPresent: boolean): JWT {
  if (accountPresent) {
    return { ...token, [SESSION_STARTED_AT_KEY]: Math.floor(Date.now() / 1000) }
  }
  if (typeof token[SESSION_STARTED_AT_KEY] === "number") {
    return token
  }
  const iat = typeof token.iat === "number" ? token.iat : Math.floor(Date.now() / 1000)
  return { ...token, [SESSION_STARTED_AT_KEY]: iat }
}

/**
 * Codifica el JWT con expiración absoluta (login + maxAge), sin renovar en cada poll.
 */
export async function encodeAbsoluteSession(params: JWTEncodeParams): Promise<string> {
  const {
    token = {},
    secret,
    maxAge = SESSION_MAX_AGE_SECONDS,
    salt = "",
  } = params

  const withStart = ensureSessionStartedAt(token as JWT, false)
  const startedAt = withStart[SESSION_STARTED_AT_KEY] as number
  const absoluteExp = startedAt + maxAge
  const now = Math.floor(Date.now() / 1000)

  if (now >= absoluteExp) {
    throw new Error("SESSION_EXPIRED")
  }

  const secretString =
    typeof secret === "string" ? secret : Buffer.from(secret).toString("utf8")
  const encryptionSecret = await getDerivedEncryptionKey(secretString, salt)

  const { exp: _exp, iat: _iat, jti: _jti, ...payload } = withStart

  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(startedAt)
    .setExpirationTime(absoluteExp)
    .setJti(uuid())
    .encrypt(encryptionSecret)
}

/** Query param en /auth/signin cuando la sesión expiró (no es logout manual). */
export const SESSION_EXPIRED_SEARCH_PARAM = "expired"

export function buildSignInUrl(options?: {
  callbackUrl?: string
  sessionExpired?: boolean
}): string {
  const params = new URLSearchParams()
  if (options?.callbackUrl) {
    params.set("callbackUrl", options.callbackUrl)
  }
  if (options?.sessionExpired) {
    params.set(SESSION_EXPIRED_SEARCH_PARAM, "1")
  }
  const qs = params.toString()
  return qs ? `/auth/signin?${qs}` : "/auth/signin"
}
