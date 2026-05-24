import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  Box,
  Users,
  UserCog,
  Receipt,
  ArrowRightLeft,
  LogOut,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export function Sidebar() {
  const { isSuperAdmin, logout, user } = useAuth()
  const navigate = useNavigate()

  const allItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, always: true },
    { to: '/companies', label: 'Companies', icon: Building2, adminOnly: true },
    { to: '/scrapyards', label: 'Scrapyards', icon: Warehouse, adminOnly: true },
    { to: '/containers', label: 'Containers', icon: Box, always: true },
    { to: '/customers', label: 'Customers', icon: Users, always: true },
    { to: '/managers', label: 'Managers', icon: UserCog, always: true },
    { to: '/invoices', label: 'Invoices', icon: Receipt, always: true },
    { to: '/movements', label: 'Movements', icon: ArrowRightLeft, always: true },
  ]

  const navItems = allItems.filter(
    (item) => item.always || (item.adminOnly && isSuperAdmin)
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-outline flex flex-col shrink-0">
      <div className="flex items-center gap-3 h-16 px-6 border-b border-outline">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-elevation-2">
          <Warehouse className="w-5 h-5 text-white" />
        </div>
        <span className="text-title-lg text-secondary-800">ScrapyardMS</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full text-label-lg transition-all duration-200 ease-emphasized',
                isActive
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-outline">
        <div className="px-4 mb-2">
          <p className="text-sm font-medium text-secondary-800 truncate">
            {user?.email}
          </p>
          <p className="text-xs text-secondary-500">
            {user?.role === 'SUPERADMIN' ? 'Super Admin' : 'Manager'}
            {user?.managerName ? ` - ${user.managerName}` : ''}
          </p>
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-full text-label-lg transition-all duration-200',
              isActive
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-800',
            )
          }
        >
          <Settings className="w-5 h-5" />
          Profile
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full text-label-lg text-secondary-600 hover:bg-error-50 hover:text-error-700 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
