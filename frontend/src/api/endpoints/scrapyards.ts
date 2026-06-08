import { apiClient } from '../client'
import type {
  ScrapYard,
  ScrapYardListItem,
  ScrapYardFormData,
  Container,
  YardStockSummary,
  ContainerStockItem,
  ScrapyardReport,
} from '@/types/models'

interface ScrapYardUpdateData {
  name?: string
  location?: string
  active?: boolean
}

export const scrapyardsApi = {
  getAll: () => apiClient<ScrapYardListItem[]>('/scrapyard/all'),

  getById: (id: number) => apiClient<ScrapYard>(`/scrapyard/id/${id}`),

  searchByName: (name: string) =>
    apiClient<ScrapYard[]>(`/scrapyard/search?name=${encodeURIComponent(name)}`),

  getByCompany: (companyId: number) =>
    apiClient<ScrapYardListItem[]>(`/scrapyard/all-yards-by-company/${companyId}`),

  create: (data: ScrapYardFormData) =>
    apiClient<ScrapYard>('/scrapyard/save', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ScrapYardUpdateData) =>
    apiClient<ScrapYard>(`/scrapyard/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiClient<string>(`/scrapyard/delete/${id}`, { method: 'DELETE' }),

  getContainers: (yardId: number) =>
    apiClient<Container[]>(`/scrapyard/${yardId}/all-containers`),

  getStock: (yardId: number) =>
    apiClient<YardStockSummary>(`/scrapyard/${yardId}/stock`),

  getStockByContainers: (yardId: number) =>
    apiClient<ContainerStockItem[]>(`/scrapyard/${yardId}/stock/containers`),

  getStockByContainer: (yardId: number, containerId: number) =>
    apiClient<ContainerStockItem>(`/scrapyard/${yardId}/stock/containers/${containerId}`),

  getReport: (yardId: number, type: string, period: string) =>
    apiClient<ScrapyardReport>(`/scrapyard/${yardId}/report?type=${type}&period=${period}`),
}
