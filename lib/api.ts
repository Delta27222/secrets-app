// Cliente para la API REST externa

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tek-secrets.onrender.com"

// Tipos basados en la documentación OpenAPI
export interface Organization {
  _id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationMembership {
  _id: string
  userId: string
  organizationId: string
  role: "owner" | "admin" | "collab"
  status: "accepted" | "pending"
  createdAt: string
  updatedAt: string
  organization: Organization
}

export interface Secret {
  _id: string
  name: string
  value: string
  description?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Añadir la interfaz Project a las interfaces existentes
export interface Project {
  _id: string
  name: string
  description?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Añadir interfaces para la gestión de miembros
export interface User {
  _id: string
  email: string
  username?: string
  displayName?: string
  createdAt: string | null
  updatedAt: string | null
}

export interface OrganizationMembershipDetail {
  _id: string
  organization_id: string
  email: string
  role: "owner" | "admin" | "collab"
  status: "accepted" | "pending"
  createdAt: string | null
  updatedAt: string | null
  user?: User
  organization?: {
    _id: string
    name: string
    slug: string
    createdAt: string | null
    updatedAt: string | null
  }
}

export interface Project {
  id: string
  name: string
  description?: string
  organizationId: string
  tags?: Record<string, string>
  createdAt: string
  updatedAt: string
}


export interface ProjectDetail {
  _id: string
  name: string
  slug: string
  description?: string
  organization_id: string
  tags?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface Environment {
  _id: string
  name: string
  slug: string
  project_id: string
  secrets: Record<string, string>
  createdAt: string
  updatedAt: string
  render_token?: string;
  render_server_id?: string;
  vercel_token?: string;
  vercel_server_id?: string;
}

export interface EnvironmentsResponse {
  environments: Environment[]
  environments_count: number
}

export interface ProjectMember {
  _id: string
  user: {
    _id: string
    email: string
    username?: string
    displayName?: string
    createdAt: string
    updatedAt: string
  }
  project: {
    _id: string
    name: string
    slug: string
    organization_id: string
    createdAt: string
    updatedAt: string
  }
  role: "admin" | "collab" | "viewer"
  createdAt: string
  updatedAt: string
}
// Función para realizar peticiones autenticadas a la API
export async function fetchWithAuth(
  url: string,
  token: string | undefined,
  tokenType: string | undefined = "Bearer",
  options: RequestInit = {},
) {
  const headers = {
    "Content-Type": "application/json",
    "X-GitHub-Token": `${token}`,
    // ...(token ? { Authorization: `${tokenType} ${token}` } : {}),
    ...options.headers,
  }

  console.log("Realizando petición a:", `${API_URL}${url}`)
  console.log("Headers:", headers)

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })
}

// Clase para manejar las peticiones a la API
export class ApiClient {
  private token?: string
  private tokenType?: string

  constructor(token?: string, tokenType?: string) {
    this.token = token
    this.tokenType = tokenType || "Bearer"
    console.log("ApiClient inicializado con token:", token ? "presente" : "ausente")
  }

  setToken(token?: string, tokenType?: string) {
    console.log("Actualizando token en ApiClient:", token ? "presente" : "ausente")
    this.token = token
    this.tokenType = tokenType || "Bearer"
  }

  hasToken(): boolean {
    return !!this.token
  }

  async getMyOrganizationMemberships(): Promise<OrganizationMembership[]> {
    console.log("Obteniendo membresías con token:", this.token ? "presente" : "ausente")
    const response = await fetchWithAuth("/v1/organizations/memberships/me", this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getMyOrganizationMemberships:", response.status, errorText)
      throw new Error(`Error al obtener membresías de organizaciones: ${response.status} ${errorText}`)
    }
    const data : OrganizationMembership[] = await response.json()
    return data.filter((e) => e.status === 'accepted')
  }

  async getOrganization(id: string): Promise<Organization> {
    const response = await fetchWithAuth(`/v1/organizations/${id}`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getOrganization:", response.status, errorText)
      throw new Error(`Error al obtener la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateOrganization(id: string, data: { name: string; slug: string }): Promise<Organization> {
    console.log(`Actualizando organización ${id} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations/${id}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateOrganization:", response.status, errorText)
      throw new Error(`Error al actualizar la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async deleteOrganization(id: string): Promise<void> {
    console.log(`Eliminando organización ${id} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations/${id}`, this.token, this.tokenType, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en deleteOrganization:", response.status, errorText)
      throw new Error(`Error al eliminar la organización: ${response.status} ${errorText}`)
    }
  }

  async getMyProjectsByOrganization(organizationId: string): Promise<Project[]> {
    console.log(
      `Obteniendo proyectos para la organización ${organizationId} con token:`,
      this.token ? "presente" : "ausente",
    )
    const response = await fetchWithAuth(`/v1/organizations/${organizationId}/projects/me`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getMyProjectsByOrganization:", response.status, errorText)
      throw new Error(`Error al obtener proyectos de la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async getOrganizationMemberships(organizationId: string): Promise<OrganizationMembershipDetail[]> {
    console.log(
      `Obteniendo miembros para la organización ${organizationId} con token:`,
      this.token ? "presente" : "ausente",
    )
    const response = await fetchWithAuth(`/v1/organizations/${organizationId}/memberships`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getOrganizationMemberships:", response.status, errorText)
      throw new Error(`Error al obtener miembros de la organización: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  async inviteOrganizationMember(
    organizationId: string,
    data: { email: string; role: "owner" | "admin" | "collab" },
  ): Promise<any> {
    console.log(`Invitando miembro a la organización ${organizationId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations/${organizationId}/invite`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify({
        organization_id: organizationId,
        email: data.email,
        role: data.role,
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en inviteOrganizationMember:", response.status, errorText)
      throw new Error(`Error al invitar miembro a la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  // Añadir método para obtener las membresías pendientes del usuario
  async getMyPendingMemberships(): Promise<OrganizationMembershipDetail[]> {
    console.log("Obteniendo membresías pendientes con token:", this.token ? "presente" : "ausente")
    const response = await fetchWithAuth("/v1/organizations/memberships/me", this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getMyPendingMemberships:", response.status, errorText)
      throw new Error(`Error al obtener invitaciones pendientes: ${response.status} ${errorText}`)
    }

    // console.log("Response pendin 1", await response)
    
    const data = await response.json()

    return data.filter((e : any) => e.status === 'pending')
  }

  async acceptMembership(memberId: string): Promise<any> {
    console.log(`Aceptando membresía ${memberId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(
      `/v1/organizations/memberships/${memberId}/accept`,
      this.token,
      this.tokenType,
      {
        method: "POST",
      },
    )
    console.log("Response aceptando membresia", response.body);
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en acceptMembership:", response.status, errorText)
      throw new Error(`Error al aceptar la invitación: ${response.status} ${errorText}`)
    }
    return response.json()
  }


  async removeOrganizationMember(memberId: string): Promise<void> {
    console.log(`Eliminando miembro ${memberId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations/memberships/${memberId}`, this.token, this.tokenType, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en removeOrganizationMember:", response.status, errorText)
      throw new Error(`Error al eliminar miembro de la organización: ${response.status} ${errorText}`)
    }
  }

  async getSecretsByOrganization(organizationId: string): Promise<Secret[]> {
    const response = await fetchWithAuth(`/v1/organizations/${organizationId}/secrets`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getSecretsByOrganization:", response.status, errorText)
      throw new Error(`Error al obtener secretos de la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async getSecret(id: string): Promise<Secret> {
    const response = await fetchWithAuth(`/v1/secrets/${id}`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getSecret:", response.status, errorText)
      throw new Error(`Error al obtener el secreto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async createSecret(
    organizationId: string,
    data: { name: string; value: string; description?: string },
  ): Promise<Secret> {
    const response = await fetchWithAuth(`/v1/organizations/${organizationId}/secrets`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en createSecret:", response.status, errorText)
      throw new Error(`Error al crear el secreto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateSecret(id: string, data: { name: string; value: string; description?: string }): Promise<Secret> {
    const response = await fetchWithAuth(`/v1/secrets/${id}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateSecret:", response.status, errorText)
      throw new Error(`Error al actualizar el secreto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async deleteSecret(id: string): Promise<void> {
    const response = await fetchWithAuth(`/v1/secrets/${id}`, this.token, this.tokenType, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en deleteSecret:", response.status, errorText)
      throw new Error(`Error al eliminar el secreto: ${response.status} ${errorText}`)
    }
  }

  async getProject(projectId: string): Promise<ProjectDetail> {
    console.log(`Obteniendo detalles del proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getProject:", response.status, errorText)
      throw new Error(`Error al obtener detalles del proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateProject(projectId: string, data: { name: string; tags?: Record<string, string> }): Promise<ProjectDetail> {
    console.log(`Actualizando proyecto ${projectId} con token:`, this.token ? "presente" : "ausente", data.tags)
    const response = await fetchWithAuth(`/v1/projects/${projectId}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify({
        project: {
          name: data.name,
          slug: "", 
          tags: data.tags,
        },
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateProject:", response.status, errorText)
      throw new Error(`Error al actualizar el proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async deleteProject(projectId: string): Promise<void> {
    console.log(`Eliminando proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}`, this.token, this.tokenType, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en deleteProject:", response.status, errorText)
      throw new Error(`Error al eliminar el proyecto: ${response.status} ${errorText}`)
    }
  }

  async getProjectEnvironments(projectId: string): Promise<EnvironmentsResponse> {
    console.log(`Obteniendo ambientes del proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}/environments`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getProjectEnvironments:", response.status, errorText)
      throw new Error(`Error al obtener ambientes del proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async getEnvironmentDetails(projectId: string, environmentSlug: string): Promise<Environment> {
    console.log(
      `Obteniendo detalles del ambiente ${environmentSlug} del proyecto ${projectId} con token:`,
      this.token ? "presente" : "ausente",
    )
    const response = await fetchWithAuth(`/v1/projects/${projectId}/${environmentSlug}`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getEnvironmentDetails:", response.status, errorText)
      throw new Error(`Error al obtener detalles del ambiente: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    console.log(`Obteniendo miembros del proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}/members`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getProjectMembers:", response.status, errorText)
      throw new Error(`Error al obtener miembros del proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateEnvironment(
    environmentId: string,
    data: {
      name: string
      slug: string
      secrets: Record<string, string>
    },
  ): Promise<Environment> {
    console.log(`Actualizando ambiente ${environmentId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/environments/${environmentId}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify({
        environment: data,
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateEnvironment:", response.status, errorText)
      throw new Error(`Error al actualizar el ambiente: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async addProjectMember(
    projectId: string,
    data: { project: string; user: string; role: string },
  ): Promise<ProjectMember> {
    console.log(`Añadiendo miembro al proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}/members`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en addProjectMember:", response.status, errorText)
      throw new Error(`Error al añadir miembro al proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async addProjectMembers(projectId: string, data: { project: string; user: string[]; role: string }): Promise<any> {
    const response = await fetchWithAuth(`/v1/projects/${projectId}/addMembers`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en addProjectMembers:", response.status, errorText)
      throw new Error(`Error al añadir miembros al proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateProjectMember(memberId: string, role: string): Promise<ProjectMember> {
    console.log(`Actualizando rol del miembro ${memberId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/members/${memberId}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateProjectMember:", response.status, errorText)
      throw new Error(`Error al actualizar rol del miembro: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async removeProjectMember(memberId: string): Promise<void> {
    console.log(`Eliminando miembro ${memberId} del proyecto con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/members/${memberId}`, this.token, this.tokenType, {
      method: "DELETE",
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en removeProjectMember:", response.status, errorText)
      throw new Error(`Error al eliminar miembro del proyecto: ${response.status} ${errorText}`)
    }
  }

  async createProject(data: {
        name: string;
        slug: string; 
        organization_id: string;
        tags?: Record<string, string>
   }): Promise<ProjectDetail> {
    console.log(`Creando proyecto con token:`, this.token ? "presente" : "ausente", "tags", data.tags)
    const response = await fetchWithAuth(`/v1/projects`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify({
        project: data,
      }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en createProject:", response.status, errorText)
      throw new Error(`Error al crear el proyecto: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async createOrganization(data: { name: string; slug: string }): Promise<Organization> {
    console.log(`Creando organización con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations`, this.token, this.tokenType, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en createOrganization:", response.status, errorText)
      throw new Error(`Error al crear la organización: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateOrganizationMemberRole(memberId: string, role: string): Promise<any> {
    console.log(`Actualizando rol del miembro ${memberId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/organizations/memberships/${memberId}`, this.token, this.tokenType, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateOrganizationMemberRole:", response.status, errorText)
      throw new Error(`Error al actualizar rol del miembro: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  //Render API methods
  async getRenderInfo(projectId: string, slug: string): Promise<any> {
    console.log(`Obteniendo información de Render para el proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/projects/${projectId}/${slug}/render_info`, this.token, this.tokenType)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en getRenderInfo:", response.status, errorText)
      throw new Error(`Error al obtener información de Render: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateRenderInfo(environmentId: string, render_server_id: string, render_token: string): Promise<any> {
    console.log(`Actualizando información de Render ${environmentId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/environments/${environmentId}/render`, this.token, this.tokenType, {
      method: "PATCH",
      body: JSON.stringify({ render_data: { render_server_id, render_token } }),
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en updateRenderInfo:", response.status, errorText)
      throw new Error(`Error al actualizar información de Render: ${response.status} ${errorText}`)
    }
    return response.json()
  }


  async syncSecretsToRender(projectId: string, slug: string): Promise<any> {
    console.log(`Sincronizando secretos con Render ambiente ${slug} del proyecto ${projectId} con token:`, this.token ? "presente" : "ausente")
    const response = await fetchWithAuth(`/v1/sync_to_render/${projectId}/${slug}`, this.token, this.tokenType)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en syncSecretsToRender:", response.status, errorText)
      throw new Error(`Error al sincronizar secretos con Render: ${response.status} ${errorText}`)
    }
    return response.json()
  }



}

// Exportamos una instancia por defecto para uso general
export const apiClient = new ApiClient()

