import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { APP_VERSION } from '@/config/version'
import { ApiError } from '@/api/client'
import { Eye, EyeOff, Lock, ShieldCheck, ArrowLeft } from 'lucide-react'
import { OTPInput } from '@/components/OTPInput'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lockedOut, setLockedOut] = useState(false)
  const [lockoutTimer, setLockoutTimer] = useState(0)

  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [tempToken, setTempToken] = useState('')

  const { login, verify2FA } = useAuth()
  const navigate = useNavigate()

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
      if (response.requires2FA) {
        setTempToken(response.tempToken ?? '')
        setShow2FA(true)
      } else if (response.mustChangePassword) {
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

  const handle2FAVerify = async () => {
    if (twoFACode.length !== 6) return
    setError('')
    setSubmitting(true)

    try {
      const response = await verify2FA(tempToken, twoFACode)
      if (response.mustChangePassword) {
        navigate('/change-password')
      } else {
        navigate('/')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Verification failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    setShow2FA(false)
    setTwoFACode('')
    setTempToken('')
    setError('')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_image.jpg')" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-outline-light shadow-elevation-1 p-8">
          <div className="flex flex-col items-center mb-6">
              <img src="/recycling_logo.png" alt="SYMS" className="w-16 h-16 object-contain mb-4" />
            <h1 className="text-xl font-bold text-secondary-800">SYMS</h1>
            <p className="text-sm text-secondary-500 mt-1">Scrap Yard Management System</p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">{APP_VERSION}</p>
            <p className="text-xs text-secondary-400 mt-0.5">Sign in to your account</p>
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
          ) : show2FA ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="w-7 h-7 text-primary-500" />
                </div>
                <h2 className="text-lg font-semibold text-secondary-800">Two-Factor Authentication</h2>
                <p className="text-sm text-secondary-500 text-center mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
                {email && (
                  <p className="text-xs text-secondary-400 mt-1">{email}</p>
                )}
              </div>

              {error && (
                <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
                  {error}
                </div>
              )}

              <div>
                <OTPInput
                  value={twoFACode}
                  onChange={setTwoFACode}
                  error={error || undefined}
                  disabled={submitting}
                />
              </div>

              <button
                onClick={handle2FAVerify}
                disabled={twoFACode.length !== 6 || submitting}
                className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
              >
                {submitting ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
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

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}
