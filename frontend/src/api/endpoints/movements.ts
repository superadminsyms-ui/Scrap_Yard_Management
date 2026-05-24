import { apiClient } from '../client'
import type { Movement, MovementFormData } from '@/types/models'

export const movementsApi = {
  getAll: () => apiClient<Movement[]>('/movement/all'),

  getById: (id: number) => apiClient<Movement>(`/movement/id/${id}`),

  getByYard: (yardId: number) =>
    apiClient<Movement[]>(`/movement/yard/${yardId}`),

  getByContainer: (containerId: number) =>
    apiClient<Movement[]>(`/movement/container/${containerId}`),

  create: (data: MovementFormData) =>
    apiClient<Movement>('/movement/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
