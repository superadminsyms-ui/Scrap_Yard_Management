import { apiClient } from '../client'
import type { Company, CompanyFormData, ScrapYard, Customer } from '@/types/models'

export const companiesApi = {
  getAll: () => apiClient<Company[]>('/company/all'),

  getById: (id: number) => apiClient<Company>(`/company/id/${id}`),

  searchByName: (name: string) =>
    apiClient<Company[]>(`/company/search?name=${encodeURIComponent(name)}`),

  create: (data: CompanyFormData) =>
    apiClient<Company>('/company/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CompanyFormData) =>
    apiClient<Company>(`/company/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<string>(`/company/delete/${id}`, { method: 'DELETE' }),

  getYards: (id: number) =>
    apiClient<ScrapYard[]>(`/company/${id}/all-yards`),

  getCustomers: (id: number) =>
    apiClient<Customer[]>(`/company/${id}/all-customers`),
}
