import { apiClient } from '../client'
import type { ReportResponse, ReportFormData, PageResponse } from '@/types/models'

export interface ReportPageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

export const reportsApi = {
  getAll: (params?: ReportPageParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    const qs = searchParams.toString()
    return apiClient<PageResponse<ReportResponse>>(`/report/all${qs ? `?${qs}` : ''}`)
  },

  create: (data: ReportFormData) =>
    apiClient<ReportResponse>('/report/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
