# Reglas para Componentes de React

## Importación de React y Hooks

- **Única importación permitida de React**: `import React from 'react';`
- **Acceso a hooks de React propios**: se invocan desde el namespace `React`, no con named imports.

```tsx
// ❌ PROHIBIDO
import { useState, useEffect } from 'react';

// ✅ OBLIGATORIO
import React from 'react';

export const SecretItem = () => {
  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    // efecto
  }, []);

  return <div>{visible ? '••••••' : 'mostrar'}</div>;
};
```

> Aplica solo a hooks propios de React (`useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`, …). Los hooks de librerías (`useSession` de next-auth) y los hooks propios de la app (`useLogs`, `useSecrets`) se importan named con normalidad.

## Componentes

- Declaraciones de función, no arrow components como default export de módulo.
- Un componente por archivo.
- Prefer named exports; `page.tsx` y `layout.tsx` pueden usar default export.
- Sin `any`, sin `console.log` en componentes de producción.
