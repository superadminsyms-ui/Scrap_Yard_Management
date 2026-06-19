import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api/endpoints/auth'
import { UserCog, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { PasswordRequirements } from '@/components/ui/PasswordRequirements'
import { TwoFASetupModal } from '@/components/TwoFASetupModal'

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [setupData, setSetupData] = useState<{ qrCodeUrl: string; secret: string } | null>(null)
  const [setupError, setSetupError] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disableError, setDisableError] = useState('')
  const [disableLoading, setDisableLoading] = useState(false)

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

    if (passwordChanged && newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (passwordChanged && !/[A-Z]/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter')
      return
    }
    if (passwordChanged && !/[a-z]/.test(newPassword)) {
      setError('New password must contain at least one lowercase letter')
      return
    }
    if (passwordChanged && !/\d/.test(newPassword)) {
      setError('New password must contain at least one digit')
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

  const handleEnable2FA = async () => {
    setSetupError('')
    setSetupLoading(true)
    try {
      const data = await authApi.setup2FA()
      setSetupData(data)
      setShowSetupModal(true)
    } catch (err: unknown) {
      if (err instanceof Error) setSetupError(err.message)
      else setSetupError('Failed to setup 2FA')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleActivate2FA = async (code: string) => {
    setSetupError('')
    setTwoFALoading(true)
    try {
      await authApi.activate2FA(code)
      setShowSetupModal(false)
      setSetupData(null)
      refreshUser()
      setSuccess('2FA activated successfully')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      if (err instanceof Error) setSetupError(err.message)
      else setSetupError('Failed to activate 2FA')
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disablePassword || disableCode.length !== 6) return
    setDisableError('')
    setDisableLoading(true)
    try {
      await authApi.disable2FA({ currentPassword: disablePassword, code: disableCode })
      setShowDisableModal(false)
      setDisablePassword('')
      setDisableCode('')
      refreshUser()
      setSuccess('2FA disabled successfully')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: unknown) {
      if (err instanceof Error) setDisableError(err.message)
      else setDisableError('Failed to disable 2FA')
    } finally {
      setDisableLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">Profile</h1>
        <p className="mt-1 text-sm text-secondary-500">Update your email or password</p>
      </div>

      <div className="space-y-6">
        {/* Profile Form */}
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 p-6">
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
                className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                 placeholder="At least 8 characters"
              />
              {newPassword && <PasswordRequirements password={newPassword} />}
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
                  className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

        {/* 2FA Section */}
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {user?.twoFactorEnabled ? (
                <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-success-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <ShieldOff className="w-6 h-6 text-secondary-500" />
                </div>
              )}
              <div>
                <h3 className="text-label-lg font-semibold text-secondary-800">Two-Factor Authentication</h3>
                <p className="text-body-sm text-secondary-600">
                  {user?.twoFactorEnabled
                    ? 'Your account is protected with 2FA'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            {user?.twoFactorEnabled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-50 text-success-700 text-label-sm font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Enabled
              </span>
            )}
          </div>

          {setupError && !showSetupModal && (
            <div className="mb-3 bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
              {setupError}
            </div>
          )}

          {user?.twoFactorEnabled ? (
            <div>
              <p className="text-body-sm text-secondary-600 mb-4">
                A verification code is required at login and for destructive backup operations.
              </p>
              <Button
                variant="danger"
                onClick={() => {
                  setDisablePassword('')
                  setDisableCode('')
                  setDisableError('')
                  setShowDisableModal(true)
                }}
              >
                <ShieldOff className="w-4 h-4" /> Disable 2FA
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-body-sm text-secondary-600 mb-4">
                Protect your account by requiring a verification code from your authenticator app.
              </p>
              <Button
                variant="primary"
                onClick={handleEnable2FA}
                disabled={setupLoading}
              >
                {setupLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Enable 2FA</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Setup Modal */}
      <TwoFASetupModal
        isOpen={showSetupModal}
        isEnabling={twoFALoading}
        qrCodeUrl={setupData?.qrCodeUrl ?? null}
        secret={setupData?.secret ?? null}
        error={setupError}
        onActivate={handleActivate2FA}
        onClose={() => {
          setShowSetupModal(false)
          setSetupData(null)
          setSetupError('')
        }}
      />

      {/* Disable Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDisableModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-3xl shadow-elevation-4 p-6 space-y-4 animate-[fadeIn_200ms_ease-emphasized]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-error-50 rounded-xl flex items-center justify-center">
                <ShieldOff className="w-6 h-6 text-error-600" />
              </div>
              <div>
                <h3 className="text-title-lg font-semibold text-error-600">Disable 2FA</h3>
                <p className="text-body-sm text-secondary-600">This reduces your account security</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-warning-50 border border-warning-200 text-body-sm text-warning-700">
              Disabling 2FA removes the extra verification layer. Anyone with your password will be able to access your account.
            </div>

            {disableError && (
              <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
                {disableError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-error-500"
                  placeholder="Your password"
                />
              </div>
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  2FA Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-error-500"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowDisableModal(false)} disabled={disableLoading}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={!disablePassword || disableCode.length !== 6 || disableLoading}
                onClick={handleDisable2FA}
              >
                {disableLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Disabling...</>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
