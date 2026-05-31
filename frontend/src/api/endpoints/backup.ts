import { apiClient, getToken } from '../client'
import type { BackupFileInfo } from '@/types/models'

export const backupApi = {
  createBackup: () =>
    apiClient<{ message: string; backup: BackupFileInfo }>('/backup/create', {
      method: 'POST',
    }),

  listBackups: () => apiClient<BackupFileInfo[]>('/backup/list'),

  downloadBackup: (filename: string) => {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(`/api/backup/download/${filename}`, { headers, cache: 'no-store' })
  },

  deleteBackup: (filename: string) =>
    apiClient<{ message: string }>(`/backup/${filename}`, {
      method: 'DELETE',
    }),

  restoreBackup: (filename: string, confirmation: string, password: string, twoFACode?: string) =>
    apiClient<{ message: string }>(`/backup/restore/${filename}`, {
      method: 'POST',
      body: JSON.stringify({ confirmation, password, twoFACode }),
    }),

  uploadBackup: (file: File) => {
    const token = getToken()
    const headers = new Headers()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const formData = new FormData()
    formData.append('file', file)
    return fetch('/api/backup/upload', {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        const message = errorBody?.message || `${res.status} ${res.statusText}`
        throw new Error(message)
      }
      return res.json()
    }).catch((err: Error) => {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error: unable to reach the server')
      }
      throw err
    })
  },

  wipeData: (confirmation: string, password: string, twoFACode?: string) =>
    apiClient<{ message: string }>('/backup/wipe', {
      method: 'POST',
      body: JSON.stringify({ confirmation, password, twoFACode }),
    }),
}
