import { useAuth } from '@/context/AuthContext'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-outline flex items-center justify-between px-6 shrink-0">
      <h1 className="text-label-lg text-secondary-500">
        SY Management System
      </h1>
      <div className="flex items-center gap-3">
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
