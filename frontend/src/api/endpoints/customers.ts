import { apiClient } from '../client'
import type { Customer, CustomerFormData, InvoiceSummary } from '@/types/models'

export const customersApi = {
  getAll: () => apiClient<Customer[]>('/customer/all'),

  getById: (id: number) => apiClient<Customer>(`/customer/id/${id}`),

  searchByName: (name: string) =>
    apiClient<Customer[]>(`/customer/search?name=${encodeURIComponent(name)}`),

  getByPersonalId: (personalId: string) =>
    apiClient<Customer>(`/customer/search-by-personal-id?personalId=${encodeURIComponent(personalId)}`),

  getByCompany: (companyId: number) =>
    apiClient<Customer[]>(`/customer/all-by-company/${companyId}`),

  create: (data: CustomerFormData) =>
    apiClient<Customer>('/customer/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CustomerFormData) =>
    apiClient<Customer>(`/customer/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<string>(`/customer/delete/${id}`, { method: 'DELETE' }),

  getInvoices: (customerId: number) =>
    apiClient<InvoiceSummary[]>(`/customer/${customerId}/invoices`),

  countByCompany: (companyId: number) =>
    apiClient<number>(`/customer/count-by-company-id/${companyId}`),
}
