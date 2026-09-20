# Estado — React Context + Custom Hooks

El estado del servidor se gestiona con **React Context + custom hooks**. No Redux, no Zustand, no TanStack Query.

## Patrón obligatorio

Cada feature tiene:
1. **Context** (`context/<Feature>Context.tsx`) — define el shape, las llamadas a la API vía `useApi()`, la lógica de estado.
2. **Provider** — se registra en `layout.tsx` raíz o en el layout del segmento correspondiente.
3. **Hook** (`hooks/use<Feature>.ts`) — exporta el consumidor del context; lanza si se usa fuera del provider.

```tsx
// context/SecretsContext.tsx
'use client';
import React from 'react';
import { useApi } from '@/hooks/useApi';
import type { Secret } from '@/lib/api';

interface SecretsContextType {
  secrets: Secret[];
  loading: boolean;
  error: string | null;
  fetchSecrets: (projectId: string, envId: string) => Promise<void>;
}

const SecretsContext = React.createContext<SecretsContextType | null>(null);

export function SecretsProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const [secrets, setSecrets] = React.useState<Secret[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSecrets = async (projectId: string, envId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/envs/${envId}/secrets`);
      setSecrets(res.data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecretsContext.Provider value={{ secrets, loading, error, fetchSecrets }}>
      {children}
    </SecretsContext.Provider>
  );
}
```

```ts
// hooks/useSecrets.ts
import React from 'react';
import { SecretsContext } from '@/context/SecretsContext';

export function useSecrets() {
  const ctx = React.useContext(SecretsContext);
  if (!ctx) throw new Error('useSecrets debe usarse dentro de SecretsProvider');
  return ctx;
}
```

## Reglas

1. **Sin fetch + useEffect sueltos en componentes.** Los datos llegan a través del hook de contexto.
2. **Cada contexto tiene `loading` y `error`.** Los componentes los consumen antes de renderizar datos.
3. **Paginación en el contexto.** El estado `PaginationMeta` (total, page, perPage) y las funciones `goToPage` / `changePerPage` viven en el contexto, no en el componente.
4. **`useApi()` es la única fuente de axios.** Ningún componente ni hook importa axios directamente.
5. Sin estado compartido entre contextos por imports mutuos. Si dos contextos necesitan el mismo dato, el más específico consume el más general vía hook.

## Contextos actuales

| Context | Hook | Responsabilidad |
|---------|------|-----------------|
| `LogsContext` | `useLogs()` | Audit logs con paginación, filtro por env/org |
| `ProjectsInfoContext` | `useProjectsInfo()` | Datos del proyecto actual + miembros |
| `MembershipsContext` | `useMemberships()` | Membresías del usuario (org/proyecto) |
| `ProjectEnvironmentsContext` | `useProjectEnvironments()` | Entornos del proyecto (staging, prod, etc.) |
| `VercelActionsContext` | `useVercelActions()` | Estado de integración con Vercel |
| `ToastContext` | `useToast()` | Notificaciones toast globales |
