# Estándares de TypeScript

## Reglas de rigurosidad

1. **Sin `any`**: está prohibido el tipo `any`. Para datos impredecibles usa `unknown` seguido de validación con Zod.
2. **Manejo de errores**: en bloques `catch (error)`, trata la variable como `unknown` y valida con `error instanceof Error`.
3. **Tipos e interfaces**:
   - Usa `type` para alias de tipos, uniones, intersecciones y tipos derivados de Zod (`z.infer`).
   - Usa `interface` para extensión de contratos de objetos complejos.

```typescript
// ❌ PROHIBIDO
try {
  // ...
} catch (e: any) {
  console.log(e.message);
}

// ✅ OBLIGATORIO
try {
  // ...
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

## Zod para validación en runtime

- Formularios, variables de entorno y respuestas de la API deben validarse con Zod en el borde.
- Tipos inferidos de Zod con `z.infer<typeof schema>`, no crear `interface` manuales para estructuras ya validadas.

```typescript
import { z } from 'zod';

export const createSecretSchema = z.object({
  key: z.string().min(1, 'La clave es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
  environment: z.enum(['development', 'staging', 'production']),
});

export type CreateSecretInput = z.infer<typeof createSecretSchema>;
```
