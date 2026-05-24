import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: string
  className?: string
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-outline shadow-elevation-1 p-6 transition-shadow duration-200 hover:shadow-elevation-2', className)}>
      <div className="flex items-center justify-between">
        <p className="text-label-md text-secondary-500">{title}</p>
        {icon && <div className="text-secondary-400">{icon}</div>}
      </div>
      <p className="mt-2 text-display font-normal text-secondary-800 tracking-tight" style={{ fontSize: '2rem' }}>{value}</p>
      {trend && <p className="mt-1 text-label-sm text-secondary-500">{trend}</p>}
    </div>
  )
}
