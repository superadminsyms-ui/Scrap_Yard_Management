import { apiClient } from '../client'
import type { DashboardStats } from '@/types/models'

export const dashboardApi = {
  getStats: () => apiClient<DashboardStats>('/dashboard/stats'),
}
