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
  Scale,
  X,
  Database,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import { Badge } from '@/components/ui'
import { APP_VERSION } from '@/config/version'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isSuperAdmin, logout, user } = useAuth()
  const navigate = useNavigate()
  const theme = useRoleTheme()

  const allItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, always: true },
    { to: '/companies', label: 'Companies', icon: Building2, adminOnly: true },
    { to: '/scrapyards', label: 'Scrapyards', icon: Warehouse, adminOnly: true },
    { to: '/containers', label: 'Containers', icon: Box, always: true },
    { to: '/customers', label: 'Customers', icon: Users, always: true },
    { to: '/managers', label: 'Managers', icon: UserCog, always: true },
    { to: '/invoices', label: 'Invoices', icon: Receipt, always: true },
    { to: '/movements', label: 'Movements', icon: ArrowRightLeft, always: true },
    { to: '/backup', label: 'Backup', icon: Database, adminOnly: true },
    { to: '/stock', label: 'Stock', icon: Scale, managerOnly: true },
    { to: '/diary', label: 'Diary', icon: BookOpen, managerOnly: true },
  ]

  const navItems = allItems.filter(
    (item) => item.always || (item.adminOnly && isSuperAdmin) || (item.managerOnly && !isSuperAdmin)
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose()
  }

  const handleNavClick = () => {
    onClose()
  }

  const sidebarContent = (
    <aside className={cn(
      'w-64 bg-sidebar flex flex-col shrink-0 h-full border-r border-sidebar-border',
    )}>
      <div className="flex items-center justify-between gap-3 h-16 px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/recycling_logo.png" alt="SYMS" className="w-9 h-9 object-contain" />
          <span className="text-title-lg text-sidebar-textActive font-medium">SYMS</span>
          <span className="text-emerald-500 text-label-sm font-normal ml-1.5">{APP_VERSION}</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 text-sidebar-text hover:text-sidebar-textActive rounded-lg hover:bg-sidebar-hover"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-lg transition-all duration-200 ease-emphasized border-l-[3px] border-transparent',
                isActive
                  ? cn(theme.sidebarActive, theme.sidebarActiveBorder)
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textActive',
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-1 mb-3">
          <p className="text-sm font-medium text-sidebar-textActive truncate">
            {user?.email}
          </p>
          <div className="mt-1.5">
            <Badge variant={theme.badge}>{theme.badgeLabel}</Badge>
          </div>
        </div>
        <div className="space-y-0.5">
          <NavLink
            to="/profile"
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-lg transition-all duration-200 border-l-[3px] border-transparent',
                isActive
                  ? cn(theme.sidebarActive, theme.sidebarActiveBorder)
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textActive',
              )
            }
          >
            <Settings className="w-5 h-5" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-label-lg text-sidebar-text hover:bg-error-500/10 hover:text-error-400 transition-all duration-200 border-l-[3px] border-transparent"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 animate-[slideInLeft_200ms_ease-emphasized]">
            {sidebarContent}
          </div>
        </div>
      )}
      <div className="hidden md:flex shrink-0">
        {sidebarContent}
      </div>
    </>
  )
}
