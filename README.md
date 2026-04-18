# tek-secrets (app)

Frontend en [Next.js](https://nextjs.org/) para el producto **tek-secrets**: gestión de proyectos, organizaciones y documentación, con autenticación vía **GitHub** ([NextAuth.js](https://next-auth.js.org/)) contra un API backend configurable.

## Requisitos

- Node.js acorde con Next.js 15 (recomendado: LTS actual)
- Cuenta de GitHub y una [OAuth App](https://github.com/settings/developers) para el login

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Variables de entorno: copia la plantilla y edita los valores.

   ```bash
   cp .env.example .env.local
   ```

3. Completa `.env.local`:

   | Variable | Descripción |
   |----------|-------------|
   | `NEXTAUTH_URL` | URL pública de esta app (en local: `http://localhost:3000`) |
   | `NEXTAUTH_SECRET` | Secreto para firmar sesiones; genera uno con `openssl rand -base64 32` |
   | `GITHUB_ID` | Client ID de la OAuth App |
   | `GITHUB_SECRET` | Client secret de la OAuth App |
   | `NEXT_PUBLIC_API_URL` | Base URL del API backend (opcional; si no se define, el código usa el valor por defecto definido en el proyecto) |

4. En la OAuth App de GitHub, configura la **Authorization callback URL** como:

   `http://localhost:3000/api/auth/callback/github`

   (En producción, sustituye el origen por el dominio real de la app.)

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor tras `build` |
| `npm run lint` | ESLint |

## Estructura principal

- `app/` — Rutas y páginas (App Router): inicio, docs, proyectos, organizaciones, sign-in.
- `app/api/auth/[...nextauth]/` — Ruta de NextAuth (GET/POST).
- `lib/api.ts` — Cliente HTTP hacia el backend (`NEXT_PUBLIC_API_URL`).
- `middleware.ts` — Protección de rutas con el token de sesión.

## Licencia y privacidad

El repositorio marca `"private": true` en `package.json`. No subas `.env.local` ni secretos al remoto; `.env.example` sirve solo como plantilla sin valores sensibles.
