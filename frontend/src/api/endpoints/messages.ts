import { apiClient } from '../client'
import type { Message, MessageFormData, Recipient, UnreadCountResponse, PageResponse } from '@/types/models'

export interface MessagePageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
}

function buildQuery(params?: MessagePageParams, extra?: Record<string, string>): string {
  const sp = new URLSearchParams()
  if (params?.page !== undefined) sp.set('page', String(params.page))
  if (params?.size !== undefined) sp.set('size', String(params.size))
  if (params?.sortBy) sp.set('sortBy', params.sortBy)
  if (params?.direction) sp.set('direction', params.direction)
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => sp.set(k, v))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export const messagesApi = {
  getAll: (params?: MessagePageParams) =>
    apiClient<PageResponse<Message>>(`/message/all${buildQuery(params)}`),

  getSent: (params?: MessagePageParams) =>
    apiClient<PageResponse<Message>>(`/message/sent${buildQuery(params)}`),

  getReceived: (unreadOnly: boolean = false, params?: MessagePageParams) =>
    apiClient<PageResponse<Message>>(`/message/received${buildQuery(params, { unreadOnly: String(unreadOnly) })}`),

  getUnreadCount: () =>
    apiClient<UnreadCountResponse>('/message/unread-count'),

  create: (data: MessageFormData) =>
    apiClient<Message>('/message/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (id: number) =>
    apiClient<Message>(`/message/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    apiClient<{ message: string }>('/message/read-all', { method: 'PUT' }),

  delete: (id: number) =>
    apiClient<{ message: string }>(`/message/${id}`, { method: 'DELETE' }),

  togglePin: (id: number) =>
    apiClient<Message>(`/message/${id}/pin`, { method: 'PUT' }),

  getRecipients: () =>
    apiClient<Recipient[]>('/message/recipients'),
}
