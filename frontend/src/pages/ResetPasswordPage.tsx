import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/endpoints/auth'
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { PasswordRequirements } from '@/components/ui/PasswordRequirements'
import { APP_VERSION } from '@/config/version'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    if (token) {
      setValidating(false)
    } else {
      const timer = setTimeout(() => {
        setValidating(false)
        setError('Invalid or missing reset token.')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter')
      return
    }
    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one digit')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      await authApi.resetPassword({ token: token!, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (validating) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login_image.jpg')" }}
      >
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-outline-light shadow-elevation-1 p-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_image.jpg')" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-outline-light shadow-elevation-1 p-8">
          <div className="flex flex-col items-center mb-6">
              <img src="/recycling_logo.png" alt="SYMS" className="w-12 h-12 object-contain mb-4" />
            <h1 className="text-xl font-bold text-secondary-800">New Password</h1>
            <p className="text-sm text-secondary-500 mt-1">
              {done ? 'Password reset successful' : 'Choose a new password'}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">{APP_VERSION}</p>
          </div>

          {done ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-sm text-secondary-500 text-center mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-xs text-secondary-400 text-center mb-6">
                Redirecting to login...
              </p>
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors shadow-elevation-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to login
              </Link>
            </div>
          ) : error && !token ? (
            <div className="flex flex-col items-center py-4">
              <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200 mb-6 w-full text-center">
                {error}
              </div>
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors shadow-elevation-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="At least 8 characters"
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
                <PasswordRequirements password={newPassword} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !newPassword || !confirmPassword}
                className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
              >
                {submitting ? 'Resetting...' : 'Reset password'}
              </button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
