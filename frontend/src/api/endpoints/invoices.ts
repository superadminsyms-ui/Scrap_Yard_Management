import { apiClient } from '../client'
import type { Invoice, InvoiceSummary, InvoiceFormData, PageResponse } from '@/types/models'

export interface InvoicePageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

export const invoicesApi = {
  getAll: (params?: InvoicePageParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    const qs = searchParams.toString()
    return apiClient<PageResponse<InvoiceSummary>>(`/invoice/all${qs ? `?${qs}` : ''}`)
  },

  getById: (id: number) => apiClient<Invoice>(`/invoice/id/${id}`),

  getByCustomer: (customerId: number, params?: InvoicePageParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    const qs = searchParams.toString()
    return apiClient<PageResponse<InvoiceSummary>>(`/invoice/all-by-customer/${customerId}${qs ? `?${qs}` : ''}`)
  },

  getByYard: (yardId: number, params?: InvoicePageParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    const qs = searchParams.toString()
    return apiClient<PageResponse<InvoiceSummary>>(`/invoice/all-by-yard/${yardId}${qs ? `?${qs}` : ''}`)
  },

  create: (data: InvoiceFormData) =>
    apiClient<Invoice>('/invoice/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
