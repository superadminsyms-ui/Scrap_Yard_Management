import { apiClient } from '../client'
import type { Manager } from '@/types/models'

export interface ManagerWithId extends Manager {
  id: number
}

export interface ManagerInsertData {
  name: string
  email: string
  phone: string
  scrapYardId: number
}

export const managersApi = {
  getAll: () => apiClient<ManagerWithId[]>('/manager/all'),

  getById: (id: number) => apiClient<ManagerWithId>(`/manager/id/${id}`),

  searchByName: (name: string) =>
    apiClient<ManagerWithId[]>(`/manager/search?name=${encodeURIComponent(name)}`),

  getByYard: (yardId: number) =>
    apiClient<ManagerWithId[]>(`/manager/yard/${yardId}/all-managers`),

  create: (data: ManagerInsertData) =>
    apiClient<ManagerWithId>('/manager/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ManagerInsertData) =>
    apiClient<ManagerWithId>(`/manager/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<string>(`/manager/delete/${id}`, { method: 'DELETE' }),
}
