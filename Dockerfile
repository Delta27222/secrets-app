# syntax=docker/dockerfile:1

# ---- deps: solo node_modules, capa cacheable mientras no cambie el lockfile ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

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

# uid/gid 1000:1000 — debe coincidir con el "user" de la task definition
# ECS (readonlyRootFilesystem + non-root, ver 04-ecs.tf).
RUN addgroup --system --gid 1000 nodejs && adduser --system --uid 1000 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
