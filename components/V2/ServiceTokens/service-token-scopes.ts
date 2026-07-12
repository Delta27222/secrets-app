export type ScopeRisk = "low" | "medium" | "high"

export const SERVICE_TOKEN_SCOPES = [
  { name: "secrets:read", category: "Secretos", risk: "high" as ScopeRisk },
  // { name: "secrets:write", category: "Secretos", risk: "high" as ScopeRisk },
  // { name: "secrets:delete", category: "Secretos", risk: "high" as ScopeRisk },
  { name: "environments:read", category: "Ambientes", risk: "high" as ScopeRisk },
  { name: "environments:list", category: "Ambientes", risk: "medium" as ScopeRisk },
  { name: "projects:read", category: "Proyectos", risk: "low" as ScopeRisk },
  { name: "projects:list", category: "Proyectos", risk: "medium" as ScopeRisk },
  { name: "org:read", category: "Organización", risk: "low" as ScopeRisk },
] as const

const LEGACY_SCOPE_RISKS: Record<string, ScopeRisk> = {
  "secrets:write": "high",
  "secrets:delete": "high",
}

export function getScopeRisk(scopeName: string): ScopeRisk {
  const scope = SERVICE_TOKEN_SCOPES.find((s) => s.name === scopeName)
  if (scope) return scope.risk
  return LEGACY_SCOPE_RISKS[scopeName] ?? "low"
}

export function getScopeRiskBadgeClass(risk: ScopeRisk): string {
  switch (risk) {
    case "high":
      return "border-red-300 bg-red-50 text-red-700"
    case "medium":
      return "border-orange-300 bg-orange-50 text-orange-700"
    case "low":
      return "border-green-300 bg-green-50 text-green-700"
  }
}

export function getScopeRiskPillClass(risk: ScopeRisk): string {
  switch (risk) {
    case "high":
      return "bg-red-100 text-red-700"
    case "medium":
      return "bg-orange-100 text-orange-700"
    case "low":
      return "bg-green-100 text-green-700"
  }
}

export function getScopeRiskLabel(risk: ScopeRisk): string {
  switch (risk) {
    case "high":
      return "Alto riesgo"
    case "medium":
      return "Riesgo medio"
    case "low":
      return "Bajo riesgo"
  }
}
