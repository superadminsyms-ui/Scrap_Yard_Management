import { apiClient } from '../client'
import type { ReportResponse, ReportFormData, ReportTemplateResponse, PageResponse } from '@/types/models'

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

  getByDate: (date: string, params?: ReportPageParams) => {
    const searchParams = new URLSearchParams()
    searchParams.set('date', date)
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    return apiClient<PageResponse<ReportResponse>>(`/report/by-date?${searchParams.toString()}`)
  },

  getByDateRange: (startDate: string, endDate: string, params?: ReportPageParams) => {
    const searchParams = new URLSearchParams()
    searchParams.set('startDate', startDate)
    searchParams.set('endDate', endDate)
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    return apiClient<PageResponse<ReportResponse>>(`/report/by-date-range?${searchParams.toString()}`)
  },

  create: (data: ReportFormData) =>
    apiClient<ReportResponse>('/report/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTemplateFromInvoices: (scrapYardId: number) => {
    const params = new URLSearchParams()
    params.set('scrapYardId', String(scrapYardId))
    return apiClient<ReportTemplateResponse>(`/report/template-from-invoices?${params.toString()}`)
  },

  existsToday: (scrapYardId: number) =>
    apiClient<{ exists: boolean }>(`/report/exists-today?scrapYardId=${scrapYardId}`),

  getByYard: (yardId: number, params?: ReportPageParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    const qs = searchParams.toString()
    return apiClient<PageResponse<ReportResponse>>(`/report/by-yard/${yardId}${qs ? `?${qs}` : ''}`)
  },

  getByYardDateRange: (yardId: number, startDate: string, endDate: string, params?: ReportPageParams) => {
    const searchParams = new URLSearchParams()
    searchParams.set('startDate', startDate)
    searchParams.set('endDate', endDate)
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    return apiClient<PageResponse<ReportResponse>>(`/report/by-yard/${yardId}/date-range?${searchParams.toString()}`)
  },
}
