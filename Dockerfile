# syntax=docker/dockerfile:1

# ---- deps: solo node_modules, capa cacheable mientras no cambie el lockfile ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# @secrets-27222633/sdk es privado (GitHub Packages, ver .npmrc). El token
# entra por secret mount de BuildKit — nunca queda en una capa de la
# imagen ni en `docker history` (a diferencia de un ARG/ENV plano).
RUN --mount=type=secret,id=github_token,env=GITHUB_TOKEN npm ci

# ---- builder: build de Next.js (output: "standalone" en next.config.mjs) ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: solo lo que hace falta para correr, usuario no-root ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node:20-alpine ya trae un usuario "node" en uid/gid 1000 — coincide con
# el "user" de la task definition ECS (readonlyRootFilesystem + non-root,
# ver 04-ecs.tf), no hace falta crear uno nuevo (y crear otro con el mismo
# gid 1000 falla: "gid '1000' in use").
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
