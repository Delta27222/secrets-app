# Estándares para el App Router de Next.js (`app/`)

## Separación de responsabilidades

1. **Rutas delegadas**: los archivos `page.tsx` actúan **exclusivamente** como wrappers/entrypoints — sin lógica propia, sin JSX extenso.
2. La UI real vive en `components/V2/` o en el componente de feature correspondiente.
3. Todo acceso a datos pasa por los hooks de contexto (`useLogs()`, `useSecrets()`, etc.) — nunca fetch directo en `page.tsx`.

```tsx
// ❌ PROHIBIDO (page.tsx con UI y lógica directa)
export default function Page() {
  const [secrets, setSecrets] = React.useState([]);
  React.useEffect(() => { fetchSecrets().then(setSecrets); }, []);
  return <div>{secrets.map(s => <div key={s.id}>{s.key}</div>)}</div>;
}

// ✅ OBLIGATORIO (page.tsx)
import { SecretsView } from '@/components/V2/SecretsView';

export default function SecretsPage() {
  return <SecretsView />;
}
```

## "use client"

- Todas las páginas autenticadas son componentes cliente — el acceso a datos usa hooks de contexto, no hay SSR de datos.
- Coloca `'use client'` en el componente raíz que consuma estado o hooks; no en `page.tsx` si la page solo delega.

## Middleware

- `middleware.ts` gestiona la protección de rutas. Siempre verificar antes de agregar nueva lógica de acceso en las páginas.
