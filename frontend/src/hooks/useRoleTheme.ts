import { useAuth } from '@/context/AuthContext'

export function useRoleTheme() {
  const { isSuperAdmin } = useAuth()

  return isSuperAdmin
    ? {
        accent: 'primary',
        sidebarActive: 'bg-primary-500/20 text-white',
        sidebarActiveBorder: 'border-primary-500',
        iconBg: 'bg-primary-500',
        iconText: 'text-white',
        badge: 'blue' as const,
        badgeLabel: 'Super Admin',
        btnPrimary: 'bg-primary-500 text-white hover:bg-primary-600',
        btnSecondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
        dot: 'bg-primary-500',
        focusRing: 'focus:ring-primary-500',
      }
    : {
        accent: 'success',
        sidebarActive: 'bg-success-500/20 text-white',
        sidebarActiveBorder: 'border-success-600',
        iconBg: 'bg-success-600',
        iconText: 'text-white',
        badge: 'green' as const,
        badgeLabel: 'Manager',
        btnPrimary: 'bg-success-600 text-white hover:bg-success-700',
        btnSecondary: 'bg-success-50 text-success-700 hover:bg-success-100',
        dot: 'bg-success-600',
        focusRing: 'focus:ring-success-600',
      }
}
