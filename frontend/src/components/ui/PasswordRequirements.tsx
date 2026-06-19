import { Check, X } from 'lucide-react'

interface Props {
  password: string
}

interface Requirement {
  label: string
  met: boolean
}

export function PasswordRequirements({ password }: Props) {
  const requirements: Requirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least 1 digit', met: /\d/.test(password) },
  ]

  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-medium text-secondary-500 mb-1">Password must contain:</p>
      {requirements.map((req) => (
        <div
          key={req.label}
          className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
            req.met ? 'text-emerald-600' : 'text-secondary-400'
          }`}
        >
          {req.met ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          {req.label}
        </div>
      ))}
    </div>
  )
}
