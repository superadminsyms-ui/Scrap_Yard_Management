import { apiClient } from '../client'
import type { Invoice, InvoiceSummary, InvoiceFormData } from '@/types/models'

export const invoicesApi = {
  getAll: () => apiClient<InvoiceSummary[]>('/invoice/all'),

  getById: (id: number) => apiClient<Invoice>(`/invoice/id/${id}`),

  getByCustomer: (customerId: number) =>
    apiClient<InvoiceSummary[]>(`/invoice/all-by-customer/${customerId}`),

  getByYard: (yardId: number) =>
    apiClient<InvoiceSummary[]>(`/invoice/all-by-yard/${yardId}`),

  create: (data: InvoiceFormData) =>
    apiClient<Invoice>('/invoice/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
