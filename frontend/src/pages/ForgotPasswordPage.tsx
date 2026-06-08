import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/endpoints/auth'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await authApi.forgotPassword({ email })
      setSent(true)
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_image.jpg')" }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-outline-light shadow-elevation-1 p-8">
          <div className="flex flex-col items-center mb-6">
              <img src="/recycling_logo.png" alt="SYMS" className="w-12 h-12 object-contain mb-4" />
            <h1 className="text-xl font-bold text-secondary-800">Reset Password</h1>
            <p className="text-sm text-secondary-500 mt-1">
              {sent ? 'Check your email' : 'Enter your email to reset'}
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-sm text-secondary-500 text-center mb-6">
                If that email exists in our system, a reset link has been sent. Check your inbox and follow the instructions.
              </p>
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
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-full border border-outline bg-surface text-sm text-secondary-800 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !email}
                className="w-full py-2.5 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-elevation-1"
              >
                {submitting ? 'Sending...' : 'Send reset link'}
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
