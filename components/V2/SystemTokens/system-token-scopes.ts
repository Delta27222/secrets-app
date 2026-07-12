// Scopes disponibles para TOKENS DE SISTEMA (globales, nivel organización).
// Incluye el scope de sistema keys:rotate usado por el Lambda de rotación.

export type ScopeRisk = "low" | "medium" | "high"

export const SYSTEM_TOKEN_SCOPES = [
  { name: "keys:rotate", category: "Sistema", risk: "high" as ScopeRisk },
  { name: "projects:list", category: "Proyectos", risk: "medium" as ScopeRisk },
  { name: "projects:read", category: "Proyectos", risk: "low" as ScopeRisk },
  { name: "environments:list", category: "Ambientes", risk: "medium" as ScopeRisk },
  { name: "org:read", category: "Organización", risk: "low" as ScopeRisk },
] as const
