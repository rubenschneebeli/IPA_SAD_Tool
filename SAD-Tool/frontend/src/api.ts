  const BASE = '/api'

  export async function login(username: string, password: string): Promise<{ username: string }> {
    const credentials = btoa(`${username}:${password}`)
    const res = await fetch(`${BASE}/auth/login`, {
      headers: { Authorization: `Basic ${credentials}` },
    })
    if (!res.ok) throw new Error('Ungültige Anmeldedaten')
    sessionStorage.setItem('credentials', credentials)
    return res.json()
  }
  
  export function logout(): void {
    sessionStorage.removeItem('credentials')
  }

  export interface TemplateDto {
    id: string
    title: string
    htmlContent: string
    createdByUsername: string | null
    createdAt: string
    updatedAt: string
  }
  
  const getAuthHeader = (): string => {
    const credentials = sessionStorage.getItem('credentials')
    return credentials ? `Basic ${credentials}` : ''
  }

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
        ...options.headers,
      },
    })
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP ${response.status}`)
    }
    if (response.status === 204) return undefined as T
    return response.json()
  }

 export const templates = {
  getAll: () => request<TemplateDto[]>('/templates'),
  getById: (id: string) => request<TemplateDto>(`/templates/${id}`),
  create: (data: { title: string; htmlContent: string }) => request<TemplateDto>('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { title: string; htmlContent: string }) => request<TemplateDto>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/templates/${id}`, { method: 'DELETE' }),
}
