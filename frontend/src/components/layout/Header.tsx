import { useAuth } from '@/context/AuthContext'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-outline flex items-center justify-between px-6 shrink-0">
      <h1 className="text-label-lg text-secondary-500">
        Scrapyard Management System
        {user?.managerName && (
          <span className="text-secondary-400"> &mdash; {user.managerName}</span>
        )}
      </h1>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-label-sm font-medium text-primary-700">
            {user?.email?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      </div>
    </header>
  )
}
