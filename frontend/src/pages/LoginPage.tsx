import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/api/client'
import { Warehouse, Eye, EyeOff, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lockedOut, setLockedOut] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Restore lockout state on mount (survives page refresh)
  useEffect(() => {
    const lockoutUntil = sessionStorage.getItem('loginLockoutUntil')
    if (lockoutUntil) {
      const remaining = Math.ceil((Number(lockoutUntil) - Date.now()) / 1000)
      if (remaining > 0) {
        setLockedOut(true)
        setLockoutTimer(remaining)
      } else {
        sessionStorage.removeItem('loginLockoutUntil')
      }
    }
  }, [])

  useEffect(() => {
    if (!lockedOut) return
    const lockoutUntil = Number(sessionStorage.getItem('loginLockoutUntil'))
    if (!lockoutUntil || lockoutUntil <= Date.now()) {
      setLockedOut(false)
      sessionStorage.removeItem('loginLockoutUntil')
      return
    }
    setLockoutTimer(Math.ceil((lockoutUntil - Date.now()) / 1000))
    const interval = setInterval(() => {
      const now = Date.now()
      const until = Number(sessionStorage.getItem('loginLockoutUntil'))
      if (!until || until <= now) {
        setLockedOut(false)
        setLockoutTimer(0)
        sessionStorage.removeItem('loginLockoutUntil')
        return
      }
      setLockoutTimer(Math.ceil((until - now) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await login({ email, password })
      if (response.mustChangePassword) {
        navigate('/change-password')
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 429) {
        sessionStorage.setItem('loginLockoutUntil', String(Date.now() + 60000))
        setLockedOut(true)
        setEmail('')
        setPassword('')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_image.jpg')" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-outline-light shadow-elevation-1 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-elevation-2 mb-4">
              <Warehouse className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-secondary-800">SY Management System</h1>
            <p className="text-sm text-secondary-500 mt-1">Sign in to your account</p>
          </div>

          {lockedOut ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-lg font-semibold text-secondary-800 mb-2">Too many login attempts</p>
              <p className="text-sm text-secondary-500 text-center mb-4">
                Your login has been temporarily locked for security reasons.
              </p>
              <div className="bg-amber-50 rounded-xl px-6 py-3 border border-amber-200">
                <p className="text-sm text-amber-700">
                  You can try again in{' '}
                  <span className="font-bold text-amber-800 text-lg">{lockoutTimer}s</span>
                </p>
              </div>
              <div className="mt-4 w-full bg-secondary-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((60 - lockoutTimer) / 60) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}
