import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/endpoints/auth'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const passwordChanged = useRef(false)
  const { refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSubmitting(true)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      passwordChanged.current = true
      await refreshUser()
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to change password')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (!passwordChanged.current) {
      logout()
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-elevation-2 mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-secondary-800">Change Password</h1>
            <p className="text-sm text-secondary-500 mt-1">You must change your password before continuing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="current" className="block text-sm font-medium text-secondary-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new" className="block text-sm font-medium text-secondary-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-secondary-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 pr-10 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
            >
              {submitting ? 'Changing...' : 'Change Password'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2.5 rounded-full text-secondary-500 font-medium text-sm hover:text-secondary-700 transition-colors mt-2"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
