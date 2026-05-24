import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/endpoints/auth'
import { UserCog } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const emailChanged = newEmail.trim() !== '' && newEmail.trim() !== user?.email
    const passwordChanged = newPassword !== ''

    if (!emailChanged && !passwordChanged) {
      setError('No changes to apply')
      return
    }

    if (passwordChanged && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordChanged && newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSubmitting(true)

    try {
      await authApi.updateProfile({
        email: emailChanged ? newEmail.trim() : undefined,
        currentPassword,
        newPassword: passwordChanged ? newPassword : undefined,
      })

      setSuccess('Profile updated. Redirecting to login...')

      setTimeout(() => {
        logout()
        navigate('/login')
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">Profile</h1>
        <p className="mt-1 text-sm text-secondary-500">Update your email or password</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 p-6">
        {success && (
          <div className="bg-success-50 text-success-700 text-sm p-3 rounded-xl border border-success-200 mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Current Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-full border border-outline bg-secondary-50 text-sm text-secondary-500"
            />
          </div>

          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-secondary-700 mb-1">
              New Email (leave blank to keep current)
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-outline bg-white text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder={user?.email || 'New email'}
            />
          </div>

          <hr className="border-outline-light" />

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700 mb-1">
              Current Password *
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-full border border-outline bg-white text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-outline bg-white text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="At least 6 characters"
            />
          </div>

          {newPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-full border border-outline bg-white text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <p className="mt-4 text-xs text-secondary-400 text-center">
          Changing your email or password will require you to log in again.
        </p>
      </div>
    </div>
  )
}
