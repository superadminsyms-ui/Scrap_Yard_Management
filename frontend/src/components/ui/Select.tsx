import { type SelectHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-label-md text-secondary-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 ease-emphasized focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-error-400 focus:ring-error-500'
              : 'border-outline focus:ring-primary-500 focus:border-primary-500',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-label-sm text-error-600">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
