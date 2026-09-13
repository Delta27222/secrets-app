# Capa de API — el único lugar donde se llama al backend

Todo acceso HTTP al backend FastAPI sale de `lib/api.ts` + el hook `useApi()`. Ningún componente ni contexto importa axios directamente.

## `useApi()` — cliente base

```ts
// hooks/useApi.ts
import axios from 'axios';
import { useSession } from 'next-auth/react';

export function useApi() {
  const { data: session } = useSession();
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
    },
  });
}
```

- **`useApi()` es la única entrada a axios.** Trae el token de la sesión NextAuth automáticamente.
- Los contextos llaman a `useApi()` y usan el cliente resultante.
- Los tipos de las respuestas están en `lib/api.ts`.

## Tipos de respuesta (`lib/api.ts`)

```ts
// ✅ Siempre tipar la respuesta
const res = await api.get<Secret[]>(`/projects/${id}/secrets`);
```

- Todas las formas de las respuestas del backend se definen en `lib/api.ts`.
- No usar `any` en los generics de axios.

## Reglas

1. Sin `fetch` directo. Solo axios vía `useApi()`.
2. Sin llamadas HTTP en `page.tsx` ni en componentes presentacionales.
3. Las llamadas API viven en el contexto correspondiente o en un hook de datos dedicado.
4. Los errores de red se capturan en el contexto y se exponen vía el campo `error` del estado.
5. El token lo adjunta `useApi()` — ningún contexto o componente lo maneja a mano.
