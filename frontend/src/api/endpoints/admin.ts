import { apiClient } from '../client'
import type { UserListResponse, UserUpdateRequest } from '@/types/models'

export const adminApi = {
  listUsers: () => apiClient<UserListResponse[]>('/admin/users'),

  getUser: (id: number) => apiClient<UserListResponse>(`/admin/users/${id}`),

  updateUser: (id: number, data: UserUpdateRequest) =>
    apiClient<UserListResponse>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  activateUser: (id: number) =>
    apiClient<UserListResponse>(`/admin/users/${id}/activate`, {
      method: 'PATCH',
    }),

  deactivateUser: (id: number) =>
    apiClient<UserListResponse>(`/admin/users/${id}/deactivate`, {
      method: 'PATCH',
    }),
}
