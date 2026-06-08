import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, type: inputType, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = inputType === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : inputType

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-label-md text-secondary-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              'w-full rounded-lg border bg-surface px-4 py-2.5 text-body-md text-secondary-800 placeholder:text-secondary-400 transition-all duration-200 ease-emphasized focus:outline-none focus:ring-2 focus:ring-offset-0',
              isPassword && 'pr-10',
              error
                ? 'border-error-400 focus:ring-error-500'
                : 'border-outline focus:ring-primary-500 focus:border-primary-500',
              className,
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-label-sm text-error-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
