import { apiClient } from '../client'
import type { Movement, MovementFormData, PageResponse } from '@/types/models'

export interface MovementPageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

function buildQuery(params?: MovementPageParams): string {
  const sp = new URLSearchParams()
  if (params?.page !== undefined) sp.set('page', String(params.page))
  if (params?.size !== undefined) sp.set('size', String(params.size))
  if (params?.sortBy) sp.set('sortBy', params.sortBy)
  if (params?.direction) sp.set('direction', params.direction)
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export const movementsApi = {
  getAll: (params?: MovementPageParams) =>
    apiClient<PageResponse<Movement>>(`/movement/all${buildQuery(params)}`),

  getById: (id: number) => apiClient<Movement>(`/movement/id/${id}`),

  getByYard: (yardId: number, params?: MovementPageParams) =>
    apiClient<PageResponse<Movement>>(`/movement/yard/${yardId}${buildQuery(params)}`),

  getByContainer: (containerId: number, params?: MovementPageParams) =>
    apiClient<PageResponse<Movement>>(`/movement/container/${containerId}${buildQuery(params)}`),

  create: (data: MovementFormData) =>
    apiClient<Movement>('/movement/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
