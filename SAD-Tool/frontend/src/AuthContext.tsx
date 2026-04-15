import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout } from './api'

interface AuthContextType {
  username: string | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => {
    return sessionStorage.getItem('username')
  })

  async function login(username: string, password: string) {
    const result = await apiLogin(username, password)
    sessionStorage.setItem('username', result.username)
    setUsername(result.username)
  }

  function logout() {
    apiLogout()
    sessionStorage.removeItem('username')
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ username, isLoggedIn: !!username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth has to be used inside of AuthProvider')
  return context
}
