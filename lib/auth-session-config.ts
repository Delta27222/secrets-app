import { EncryptJWT } from "jose"
import hkdf from "@panva/hkdf"
import { v4 as uuid } from "uuid"
import type { JWT } from "next-auth/jwt"
import type { JWTEncodeParams } from "next-auth/jwt"

/**
 * Configuración de sesión según environment.
 * Basado en NODE_ENV (production | development)
 */
const SESSION_CONFIG = {
  production: {
    maxAgeSeconds: 30 * 60,      // 30 minutos sin actividad
    heartbeatIntervalMs: 2 * 60 * 1000, // Renovar cada 2 minutos
  },
  development: {
    maxAgeSeconds: 5 * 60,       // 5 minutos sin actividad (testing rápido)
    heartbeatIntervalMs: 2 * 60 * 1000,     // Renovar cada 2 minutos
  },
}

const isProduction = process.env.NODE_ENV === "production"
const config = isProduction ? SESSION_CONFIG.production : SESSION_CONFIG.development

/**
 * Sesión máxima sin actividad (segundos).
 * Frontend detecta actividad y renueva sesión continuamente.
 * Si inactividad > SESSION_MAX_AGE_SECONDS, sesión caduca.
 */
export const SESSION_MAX_AGE_SECONDS = config.maxAgeSeconds

/**
 * Heartbeat activity tracking.
 * Frontend envía heartbeat cada HEARTBEAT_INTERVAL_MS si hay actividad detectada.
 */
export const HEARTBEAT_INTERVAL_MS = config.heartbeatIntervalMs

export const ACTIVITY_DEBOUNCE_MS = 500 // Debounce detectores de actividad (fijo)

export const SESSION_STARTED_AT_KEY = "sessionStartedAt"

/**
 * Ya no hacemos polling automático de sesión.
 * El heartbeat de actividad reemplaza esto.
 */
export const SESSION_REFETCH_INTERVAL_SECONDS = 0 // Deshabilitado

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
