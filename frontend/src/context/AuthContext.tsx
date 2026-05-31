import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/api/endpoints/auth'
import { setInMemoryToken, clearAuth, getToken } from '@/api/client'
import type { User, LoginRequest, LoginResponse } from '@/types/models'
import { useQueryClient } from '@tanstack/react-query'

interface AuthState {
  user: User | null
  token: string | null
  tempToken: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isManager: boolean
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<LoginResponse>
  verify2FA: (tempToken: string, code: string) => Promise<LoginResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredAuth(): { token: string | null; user: User | null } {
  try {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { token: parsed.token || null, user: parsed.user || null }
    }
  } catch {
    // ignore
  }
  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuth()
    if (storedToken) {
      setToken(storedToken)
      setUser(storedUser)
      authApi.me()
        .then((freshUser) => {
          setUser(freshUser)
          saveAuth(storedToken, freshUser)
        })
        .catch(() => {
          setToken(null)
          setUser(null)
          localStorage.removeItem('auth')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const saveAuth = (t: string, u: User) => {
    localStorage.setItem('auth', JSON.stringify({ token: t, user: u }))
  }

  const buildUserFromResponse = (response: LoginResponse): User => ({
    id: response.userId,
    email: response.email,
    role: response.role as User['role'],
    yardId: response.yardId,
    managerName: response.managerName,
    mustChangePassword: response.mustChangePassword,
    active: true,
    twoFactorEnabled: response.twoFactorEnabled,
  })

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.login(data)

    if (response.requires2FA) {
      setTempToken(response.tempToken ?? null)
      return response
    }

    const userInfo = buildUserFromResponse(response)
    setToken(response.token)
    setUser(userInfo)
    if (response.mustChangePassword) {
      setInMemoryToken(response.token)
    } else {
      saveAuth(response.token, userInfo)
    }
    return response
  }, [])

  const verify2FA = useCallback(async (tToken: string, code: string): Promise<LoginResponse> => {
    const response = await authApi.verify2FA(tToken, code)
    const userInfo = buildUserFromResponse(response)
    setToken(response.token)
    setUser(userInfo)
    setTempToken(null)
    if (response.mustChangePassword) {
      setInMemoryToken(response.token)
    } else {
      saveAuth(response.token, userInfo)
    }
    return response
  }, [])

  const logout = useCallback(() => {
    const currentToken = getToken()
    if (currentToken) {
      authApi.logout(currentToken)
    }
    setToken(null)
    setUser(null)
    setTempToken(null)
    clearAuth()
    queryClient.clear()
  }, [queryClient])

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authApi.me()
      setUser(freshUser)
      if (token) saveAuth(token, freshUser)
    } catch {
      // ignore
    }
  }, [token])

  const isAuthenticated = !!token && !!user
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const isManager = user?.role === 'MANAGER'

  return (
    <AuthContext.Provider
      value={{
        user, token, tempToken, isAuthenticated, isSuperAdmin, isManager, loading,
        login, verify2FA, logout, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
