import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'green' | 'red' | 'blue' | 'yellow' | 'gray' | 'orange'
  children: ReactNode
  className?: string
}

const variants = {
  green: 'bg-success-100 text-success-800',
  red: 'bg-error-100 text-error-800',
  blue: 'bg-primary-100 text-primary-700',
  yellow: 'bg-warning-100 text-warning-800',
  gray: 'bg-secondary-100 text-secondary-700',
  orange: 'bg-warning-100 text-warning-800',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
