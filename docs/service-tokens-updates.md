# Service Tokens — Resumen de cambios (Frontend)

Gestión de tokens de servicio por proyecto en Tek Secrets: creación, listado, detalle, rotación y revocación desde la UI del proyecto.

---

## Integración

| Ubicación | Cambio |
|-----------|--------|
| `app/projects/[id]/page.tsx` | Nueva pestaña **Service Tokens** (solo admin del proyecto u org owner/admin) |
| `app/layout.tsx` | `ServiceTokensProvider` envuelve la app |
| `hooks/useServiceTokens.ts` | Hook que consume el contexto |
| `context/ServiceTokensContext.tsx` | Estado centralizado + llamadas al API |

---

## API Client (`lib/api.ts`)

Tipos:

- `ServiceToken` — metadata del token (sin secret)
- `ServiceTokenCreateResponse` — incluye `tokenSecret` y `warning` (solo al crear)
- `ServiceTokenRotateResponse` — `new_token_id`, `new_token_secret`, `warning`
- `ServiceTokenUsage` — contadores de uso

Endpoints consumidos:

| Método | Ruta | Uso |
|--------|------|-----|
| `POST` | `/v1/projects/{id}/tokens` | Crear token |
| `GET` | `/v1/projects/{id}/tokens` | Listar tokens |
| `GET` | `/v1/projects/{id}/tokens/{tokenId}` | Detalle |
| `DELETE` | `/v1/projects/{id}/tokens/{tokenId}` | Revocar |
| `POST` | `/v1/projects/{id}/tokens/{tokenId}/rotate` | Rotar |
| `GET` | `/v1/projects/{id}/tokens/{tokenId}/usage` | Uso del token |

---

## Componentes UI

| Componente | Responsabilidad |
|------------|-----------------|
| `ServiceTokensManager` | Orquesta listado + modal de creación; carga tokens al montar |
| `ServiceTokenList` | Tabla con acciones ver / rotar / revocar |
| `ServiceTokenCreate` | Formulario de creación + pantalla de copia del secret |
| `ServiceTokenDetailDialog` | Detalle: estado, ID, scopes, fechas, uso |
| `ServiceTokenRevokeDialog` | Confirmación con `AlertDialog` antes de revocar |
| `ServiceTokenRotatedDialog` | Muestra nuevo ID y secret tras rotación |
| `service-token-scopes.ts` | Catálogo de scopes, riesgo y estilos por nivel |

---

## Funcionalidades

### Crear token

- Campos: nombre, descripción, scopes (checkboxes por categoría), expiración.
- Expiración como **Select**: 10, 30, 45, 75 o 90 días (default 90).
- Scopes por defecto: `[]` — el usuario debe elegir al menos uno.
- Tras crear: muestra el **secret una sola vez**; flujo copiar → “Listo, volver a tokens”.
- El token nuevo se **agrega al inicio de la lista** sin recargar toda la página.

### Listado

- Columnas: Nombre, Permisos, Estado, Creado, **Expira** (reemplazó “Actualizado”).
- Tokens vencidos: fila en rojo (`bg-red-50`), badge **expirado**, etiqueta **VENCIDO**.
- Estados vacío y carga centrados con `min-h-[420px]`.
- Toasts para carga, rotación, revocación y errores.

### Scopes y riesgo

Colores por nivel de riesgo en badges:

| Riesgo | Color |
|--------|-------|
| Alto | Rojo |
| Medio | Naranja |
| Bajo | Verde |

Scopes disponibles en el formulario:

- `secrets:read`
- `environments:read`, `environments:list`
- `projects:read`, `projects:list`
- `org:read`

> `secrets:write` y `secrets:delete` están **comentados** en el catálogo (no se ofrecen en UI por ahora).

### Rotar token

- Botón deshabilitado si el token no está activo o está expirado.
- Tras rotar: diálogo con `new_token_id` y `new_token_secret`; el anterior queda revocado.
- La lista se refresca automáticamente vía contexto.

### Revocar token

- Modal de confirmación alineado con otros diálogos destructivos del proyecto.
- Elimina el token de la lista local tras éxito.

---

## Contexto — optimizaciones

- **`createToken`**: no activa `loading` global → evita doble parpadeo de la tabla.
- **`createToken`**: hace prepend del token (sin `tokenSecret`) a `tokens`.
- **`rotateToken`**: refresca la lista completa después de rotar.
- **`deleteToken`**: filtra el token revocado del estado local.

---

## Acceso

Visible solo para usuarios con rol:

- **admin** del proyecto, o
- **owner** / **admin** de la organización

---

## Archivos principales

```
components/V2/ServiceTokens/
├── ServiceTokensManager.tsx
├── ServiceTokenList.tsx
├── ServiceTokenCreate.tsx
├── ServiceTokenDetailDialog.tsx
├── ServiceTokenRevokeDialog.tsx
├── ServiceTokenRotatedDialog.tsx
└── service-token-scopes.ts

context/ServiceTokensContext.tsx
hooks/useServiceTokens.ts
lib/api.ts  (tipos + métodos)
```
