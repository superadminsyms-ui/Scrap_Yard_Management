import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-label-md text-secondary-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-body-md text-secondary-800 placeholder:text-secondary-400 transition-all duration-200 ease-emphasized focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-error-400 focus:ring-error-500'
              : 'border-outline focus:ring-primary-500 focus:border-primary-500',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-label-sm text-error-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
