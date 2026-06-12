import { apiClient } from '../client'
import type { CashFlowResponse, CashFlowFormData, PageResponse } from '@/types/models'

export interface CashFlowPageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

function buildParams(params?: CashFlowPageParams) {
  const searchParams = new URLSearchParams()
  if (params?.page !== undefined) searchParams.set('page', String(params.page))
  if (params?.size !== undefined) searchParams.set('size', String(params.size))
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params?.direction) searchParams.set('direction', params.direction)
  return searchParams.toString()
}

export const cashFlowApi = {
  getAll: (params?: CashFlowPageParams) => {
    const qs = buildParams(params)
    return apiClient<PageResponse<CashFlowResponse>>(`/cashflow/all${qs ? `?${qs}` : ''}`)
  },

  getByYard: (yardId: number, params?: CashFlowPageParams) => {
    const qs = buildParams(params)
    return apiClient<PageResponse<CashFlowResponse>>(`/cashflow/yard/${yardId}${qs ? `?${qs}` : ''}`)
  },

  getByManager: (managerId: number, params?: CashFlowPageParams) => {
    const qs = buildParams(params)
    return apiClient<PageResponse<CashFlowResponse>>(`/cashflow/manager/${managerId}${qs ? `?${qs}` : ''}`)
  },

  create: (data: CashFlowFormData) =>
    apiClient<CashFlowResponse>('/cashflow/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  existsToday: (scrapYardId: number) =>
    apiClient<{ exists: boolean }>(`/cashflow/exists-today?scrapYardId=${scrapYardId}`),
}
