import { Menu } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import { cn } from '@/lib/utils'
import { dashboardApi } from '@/api/endpoints/dashboard'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, isSuperAdmin } = useAuth()
  const theme = useRoleTheme()

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    enabled: !isSuperAdmin,
  })

  return (
    <header className="h-16 bg-surface border-b border-outline flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-surface-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full shrink-0', theme.dot)} />
          <h1 className="text-label-lg text-secondary-500">
            SY Management System
          </h1>
        </div>
      </div>

      {stats?.scrapyardName && (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-100 border border-outline">
            <span className={cn('w-2 h-2 rounded-full', theme.dot)} />
            <span className="text-sm font-semibold text-secondary-800">{stats.scrapyardName}</span>
            {stats.scrapyardLocation && (
              <span className="text-xs text-secondary-400">&middot; {stats.scrapyardLocation}</span>
            )}
          </div>
        </div>
      )}

      <div className="hidden md:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-secondary-800">
            Welcome to SY Management System,{' '}
            {user?.role === 'SUPERADMIN' ? 'Super Admin' : user?.managerName}
          </p>
          <p className="text-xs text-secondary-400">{user?.email}</p>
        </div>
      </div>
    </header>
  )
}
