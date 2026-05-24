import { apiClient } from '../client'
import type { Container, ContainerFormData, ContainerUpdateFormData, MaterialType } from '@/types/models'

export const containersApi = {
  getAll: () => apiClient<Container[]>('/container/all'),

  getById: (id: number) => apiClient<Container>(`/container/id/${id}`),

  getByMaterial: (material: MaterialType) =>
    apiClient<Container[]>(`/container/by-material?material=${material}`),

  getByCompany: (companyId: number) =>
    apiClient<Container[]>(`/container/company/${companyId}/containers`),

  create: (data: ContainerFormData) =>
    apiClient<Container>('/container/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ContainerUpdateFormData) =>
    apiClient<Container>(`/container/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<string>(`/container/delete/${id}`, { method: 'DELETE' }),
}
