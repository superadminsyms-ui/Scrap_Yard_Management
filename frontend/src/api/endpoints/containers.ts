import { apiClient } from '../client'
import type { Container, ContainerFormData, ContainerUpdateFormData, MaterialType, PageResponse } from '@/types/models'

export interface ContainerPageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

function buildQuery(params?: ContainerPageParams, extra?: Record<string, string>): string {
  const sp = new URLSearchParams()
  if (params?.page !== undefined) sp.set('page', String(params.page))
  if (params?.size !== undefined) sp.set('size', String(params.size))
  if (params?.sortBy) sp.set('sortBy', params.sortBy)
  if (params?.direction) sp.set('direction', params.direction)
  if (extra) Object.entries(extra).forEach(([k, v]) => sp.set(k, v))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export const containersApi = {
  getAll: (params?: ContainerPageParams) =>
    apiClient<PageResponse<Container>>(`/container/all${buildQuery(params)}`),

  getById: (id: number) => apiClient<Container>(`/container/id/${id}`),

  getByMaterial: (material: MaterialType, params?: ContainerPageParams) =>
    apiClient<PageResponse<Container>>(`/container/by-material${buildQuery(params, { material })}`),

  getByYard: (yardId: number, params?: ContainerPageParams) =>
    apiClient<PageResponse<Container>>(`/container/by-yard${buildQuery(params, { yardId: String(yardId) })}`),

  getByCompany: (companyId: number, params?: ContainerPageParams) =>
    apiClient<PageResponse<Container>>(`/container/company/${companyId}/containers${buildQuery(params)}`),

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
