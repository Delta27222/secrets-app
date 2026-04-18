# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tek Secrets** — Next.js secret management application for organizations. Users manage projects, environments, secrets, memberships, and audit logs.

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, NextAuth, Zod

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run Next.js lint
```

## Architecture

### State Management Pattern

Centralized state via **React Context + custom hooks**. No Redux/Zustand. Pattern:

1. **Context** (`context/*.tsx`) — Defines shape, API calls, state logic
2. **Provider** — Wraps app in `layout.tsx`, manages context
3. **Hook** (`hooks/*.ts`) — Exports context consumer; enforces "use only in client components"

**Example flow:**
- `LogsContext` → `LogsProvider` (layout.tsx) → `useLogs()` hook → components consume via hook

**Current contexts:**
- `LogsContext` — Audit logs with pagination, fetching by environment/org
- `ProjectsInfoContext` — Current project data + members
- `MembershipsContext` — User org/project memberships
- `ProjectEnvironmentsContext` — Environments (staging, prod, etc.)
- `VercelActionsContext` — Vercel integration state
- `RenderActionsContext` — UI state for action rendering
- `ToastContext` — Toast notifications

### API Data Flow

1. Components/hooks call `useApi()` → axios instance with auth headers
2. API responses typed via `@/lib/api` types
3. Results stored in context state
4. Components consume via custom hooks + context

### File Organization

```
app/                 # Next.js App Router (pages, layouts, API routes)
├── api/            # API routes (nextauth)
├── auth/           # Auth pages
├── organizations/  # Org pages + projects
└── projects/       # Project detail pages

components/         # React components
├── ui/             # Radix-based UI primitives (button, dialog, etc.)
├── V2/             # Larger feature components (tables, forms)
└── *-form.tsx      # Specific forms (secret, project creation)

context/            # Context + provider definitions
hooks/              # Custom hooks consuming contexts
lib/                # Utilities, types, API client setup
types/              # TypeScript global types
utils/              # Helper functions
```

### Key Patterns

**Type-safe API responses:**
```typescript
// lib/api defines types: Log, ProjectDetail, ProjectMember, etc.
// Responses match these shapes; use Zod for runtime validation if needed
```

**Pagination:**
- Contexts store `PaginationMeta` (total, page, perPage)
- Fetch functions accept page/perPage params; update context + pagination state
- Components render pagination UI; call `goToPage()` or `changePerPage()`

**Loading/Error states:**
- Each context tracks `loading` / `error` boolean
- Components check before rendering; show spinners/messages

**Recent work (TEK-SECRETS-APP-LOGS-INTEGRATION):**
- Added `LogsContext` + `useLogs` hook
- `LogsTable` component with filtering, search, pagination
- Fetch logs by environment or entire organization
- Enriched logs with user info (id, email, displayName)

## Notable Implementation Details

- **Environments as contexts:** Project envs (prod, staging) modeled as separate contexts, not nested state
- **Pagination by design:** Logs + org features use cursor/offset pagination from backend
- **"use client" everywhere:** Client-side data fetching; no SSR for authenticated pages
- **Radix UI:** All interactive primitives from Radix; compose with Tailwind
- **Middleware:** `middleware.ts` exists; check before adding route protection

## Common Tasks

**Add new context:**
1. Create `context/NewContext.tsx` with type + default value
2. Export provider from `context/index.ts`
3. Wrap in `layout.tsx`
4. Export hook `useNew()` from `hooks/index.ts`

**Fetch data in component:**
```typescript
const { data, loading } = useCustomContext();
useEffect(() => {
  if (!data) contextFunction();  // Call fetch on mount
}, []);
```

**Add UI component:**
Use Radix primitives from `components/ui/`; style with Tailwind. Don't add to `ui/` unless truly reusable.

**Pagination example:**
```typescript
const { logs, pagination, goToPage } = useLogs();
// Call goToPage(2) to fetch page 2; context updates automatically
```
