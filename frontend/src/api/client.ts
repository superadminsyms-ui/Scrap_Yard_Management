const API_BASE = '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// In-memory token for when mustChangePassword=true (not persisted to localStorage)
let inMemoryToken: string | null = null

export function setInMemoryToken(token: string | null) {
  inMemoryToken = token
}

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken
  try {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const { token } = JSON.parse(stored)
      return token || null
    }
  } catch {
    return null
  }
  return null
}

export function clearAuth() {
  inMemoryToken = null
  localStorage.removeItem('auth')
}

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...headers, ...((options?.headers as Record<string, string>) || {}) },
    cache: 'no-store',
    ...options,
  })

  if (response.status === 401) {
    clearAuth()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  if (response.status === 429) {
    throw new ApiError(429, 'Too many requests. Please wait a moment and try again.')
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    let message: string
    if (errorBody && typeof errorBody === 'object' && !Array.isArray(errorBody)) {
      const fieldErrors = Object.entries(errorBody)
        .filter(([, v]) => typeof v === 'string')
        .map(([k, v]) => `${k}: ${v}`)
      if (fieldErrors.length > 0) {
        message = fieldErrors.join(' | ')
      } else if (typeof (errorBody as Record<string, unknown>).message === 'string') {
        message = (errorBody as Record<string, string>).message
      } else if (typeof (errorBody as Record<string, unknown>).Error === 'string') {
        message = (errorBody as Record<string, string>).Error
      } else {
        message = `${response.status} ${response.statusText}`
      }
    } else if (typeof errorBody === 'string') {
      message = errorBody
    } else {
      message = `${response.status} ${response.statusText}`
    }
    throw new ApiError(response.status, message)
  }
  const text = await response.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

export { ApiError, apiClient }
