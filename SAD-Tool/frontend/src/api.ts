

  
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
  
 