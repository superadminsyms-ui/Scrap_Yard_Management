import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck, Copy, CheckCircle, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { OTPInput } from '@/components/OTPInput'

interface TwoFASetupModalProps {
  isOpen: boolean
  isEnabling: boolean
  qrCodeUrl: string | null
  secret: string | null
  error: string
  onActivate: (code: string) => void
  onClose: () => void
}

export function TwoFASetupModal({
  isOpen,
  isEnabling,
  qrCodeUrl,
  secret,
  error,
  onActivate,
  onClose,
}: TwoFASetupModalProps) {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCode('')
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-3xl shadow-elevation-4 p-6 space-y-5 animate-[fadeIn_200ms_ease-emphasized]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 className="text-title-lg font-semibold text-secondary-800">Set Up 2FA</h3>
            <p className="text-body-sm text-secondary-600">Scan QR code with your authenticator app</p>
          </div>
        </div>

        <div className="p-4 bg-primary-50 rounded-xl border border-primary-200 text-body-sm text-primary-700">
          Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP-compatible app.
        </div>

        {qrCodeUrl && (
          <div className="flex justify-center p-4 bg-white rounded-xl border border-outline-light">
            <QRCodeSVG value={qrCodeUrl} size={180} level="M" />
          </div>
        )}

        {secret && (
          <div>
            <label className="text-label-lg font-medium text-secondary-800 block mb-1.5">
              Or enter this code manually
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-secondary-100 text-body-md text-secondary-800 font-mono tracking-wider text-center select-all">
                {secret}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-secondary-100 text-secondary-500 hover:text-secondary-700 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="text-label-lg font-medium text-secondary-800 block mb-2 text-center">
            Enter the 6-digit code from your app
          </label>
          <OTPInput value={code} onChange={setCode} error={error} disabled={isEnabling} />
          {error && (
            <p className="mt-2 text-center text-label-sm text-error-600">{error}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="secondary" onClick={onClose} disabled={isEnabling}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={code.length !== 6 || isEnabling}
            onClick={() => onActivate(code)}
          >
            {isEnabling ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Activating...</>
            ) : (
              <>Activate</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
