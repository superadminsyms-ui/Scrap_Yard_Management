import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { containersApi } from '@/api/endpoints/containers'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { companiesApi } from '@/api/endpoints/companies'
import { Button, Input, Select, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner, Badge } from '@/components/ui'
import { MaterialType, ContainerSize, UnitOfMeasure } from '@/types/models'
import type { Container, ContainerFormData } from '@/types/models'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MATERIAL_LABELS: Record<MaterialType, string> = {
  [MaterialType.ALUMINIUM]: 'Aluminum',
  [MaterialType.IRON]: 'Iron',
  [MaterialType.MOTOR]: 'Motor',
  [MaterialType.BATTERY]: 'Battery',
  [MaterialType.STAINLESS_STEEL]: 'Stainless Steel',
  [MaterialType.REFER]: 'Refer',
  [MaterialType.CIRCUIT_BOARD]: 'Circuit Board',
  [MaterialType.COPPER]: 'Copper',
  [MaterialType.BRASS]: 'Brass',
  [MaterialType.CATALYST]: 'Catalyst',
  [MaterialType.ALUMINIUM_CANS]: 'Aluminum Cans',
}

const MATERIAL_COLORS: Record<MaterialType, 'green' | 'red' | 'blue' | 'yellow' | 'gray' | 'orange'> = {
  [MaterialType.ALUMINIUM]: 'gray',
  [MaterialType.IRON]: 'red',
  [MaterialType.MOTOR]: 'yellow',
  [MaterialType.BATTERY]: 'orange',
  [MaterialType.STAINLESS_STEEL]: 'blue',
  [MaterialType.REFER]: 'green',
  [MaterialType.CIRCUIT_BOARD]: 'blue',
  [MaterialType.COPPER]: 'red',
  [MaterialType.BRASS]: 'yellow',
  [MaterialType.CATALYST]: 'green',
  [MaterialType.ALUMINIUM_CANS]: 'gray',
} as const

export default function ContainersPage() {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()
  const [materialFilter, setMaterialFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { data: containers, isLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: containersApi.getAll,
  })

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  })

  const materialFilteredQuery = useQuery({
    queryKey: ['containers-by-material', materialFilter],
    queryFn: () => containersApi.getByMaterial(materialFilter as MaterialType),
    enabled: !!materialFilter,
  })

  const companyFilteredQuery = useQuery({
    queryKey: ['containers-by-company', companyFilter],
    queryFn: () => containersApi.getByCompany(companyFilter),
    enabled: companyFilter > 0,
  })

  const displayedContainers = materialFilter
    ? materialFilteredQuery.data || []
    : companyFilter > 0
      ? companyFilteredQuery.data || []
      : containers || []

  const createMutation = useMutation({
    mutationFn: (data: ContainerFormData) => containersApi.create(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['containers'] })
      queryClient.removeQueries({ queryKey: ['containers-by-material'] })
      setModalOpen(false)
      setEditingContainer(null)
    },
    onError: (err: Error) => alert('Error creating: ' + err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { description?: string; materialType?: MaterialType } }) =>
      containersApi.update(id, data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['containers'] })
      queryClient.removeQueries({ queryKey: ['containers-by-material'] })
      setModalOpen(false)
      setEditingContainer(null)
    },
    onError: (err: Error) => alert('Error updating: ' + err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => containersApi.delete(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['containers'] })
      queryClient.removeQueries({ queryKey: ['containers-by-material'] })
      setDeleteId(null)
    },
    onError: (err: Error) => alert('Error deleting: ' + err.message),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Containers" description="Material container management">
        <Button onClick={() => { setEditingContainer(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> New Container
        </Button>
      </PageHeader>

      <div className="mb-4 flex gap-3 flex-wrap">
        {isSuperAdmin && (
          <Select
            value={companyFilter || ''}
            onChange={(e) => { setCompanyFilter(Number(e.target.value)); setMaterialFilter('') }}
            label="Filter by company"
            className="max-w-xs"
          >
            <option value="">All companies</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        )}
        <Select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          label="Filter by material"
          className="max-w-xs"
        >
          <option value="">All materials</option>
          {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {!displayedContainers.length ? (
        <EmptyState
          title="No containers"
          description={materialFilter || companyFilter > 0 ? 'No containers match the filter' : 'Create the first container'}
          action={!materialFilter && !companyFilter ? { label: 'New Container', onClick: () => setModalOpen(true) } : undefined}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">ID</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Description</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Size</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Weight</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedContainers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-100">
                  <td className="px-6 py-4 font-medium text-secondary-800">#{c.id}</td>
                  <td className="px-6 py-4 text-secondary-600">{c.description}</td>
                  <td className="px-6 py-4">
                    <Badge variant={MATERIAL_COLORS[c.materialType] || 'gray'}>
                      {MATERIAL_LABELS[c.materialType] || c.materialType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{c.containerSize}</td>
                  <td className="px-6 py-4 text-right text-secondary-800 font-medium">
                    {c.materialWeight ?? '-'} {c.unit}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingContainer(c); setModalOpen(true) }}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-2 text-secondary-400 hover:text-error-500 rounded-lg hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingContainer(null) }}
        title={editingContainer ? 'Edit Container' : 'New Container'}
      >
        <ContainerForm
          initial={editingContainer}
          yards={yards || []}
          onSubmit={
            editingContainer
              ? (data) => updateMutation.mutate({ id: editingContainer.id, data: { description: data.description, materialType: data.materialType } })
              : (data) => createMutation.mutate(data)
          }
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Container"
        message="Are you sure you want to delete this container?"
      />
    </div>
  )
}

function ContainerForm({
  initial,
  yards,
  onSubmit,
  isLoading,
}: {
  initial: Container | null
  yards: { id: number; name: string }[]
  onSubmit: (data: ContainerFormData) => void
  isLoading: boolean
}) {
  const [form, setForm] = useState({
    description: initial?.description || '',
    materialWeight: initial?.materialWeight ?? 0,
    containerSize: initial?.containerSize || ContainerSize.FT_20,
    scrapYardId: 0,
    materialType: initial?.materialType || MaterialType.IRON,
    unitOfMeasure: UnitOfMeasure.KILOGRAMS,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.description)) newErrors.description = 'Only letters allowed'
    if (!form.description.trim()) newErrors.description = 'Description required'
    if (isNaN(form.materialWeight) || form.materialWeight < 0) newErrors.materialWeight = 'Weight cannot be negative'
    if (!initial && !form.scrapYardId) newErrors.scrapYardId = 'Select a scrapyard'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    if (!initial) {
      onSubmit(form as ContainerFormData)
    } else {
      onSubmit({ description: form.description, materialType: form.materialType } as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        error={errors.description}
        placeholder="E.g.: Copper container #1"
      />
      {initial && initial.materialWeight != null && initial.materialWeight > 0 && (
        <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-xl border border-amber-200">
          Material type cannot be changed because this container already has material assigned.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Material Type"
          value={form.materialType}
          onChange={(e) => setForm({ ...form, materialType: e.target.value as MaterialType })}
          disabled={!!initial && initial.materialWeight != null && initial.materialWeight > 0}
        >
          {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        {!initial ? (
          <Select
            label="Size"
            value={form.containerSize}
            onChange={(e) => setForm({ ...form, containerSize: e.target.value as ContainerSize })}
          >
            <option value={ContainerSize.FT_20}>20 FT</option>
            <option value={ContainerSize.FT_40}>40 FT</option>
          </Select>
        ) : (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Size</label>
            <p className="text-sm text-secondary-800 bg-surface-50 rounded-lg px-3 py-2">
              {initial.containerSize} (not editable)
            </p>
          </div>
        )}
      </div>
      {!initial && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Material Weight"
            type="number"
            step="0.01"
            value={isNaN(form.materialWeight) ? '' : form.materialWeight}
            onChange={(e) => setForm({ ...form, materialWeight: parseFloat(e.target.value) || 0 })}
            error={errors.materialWeight}
            placeholder="0.00"
          />
          <Select
            label="Unit of Measure"
            value={form.unitOfMeasure}
            onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value as UnitOfMeasure })}
          >
            <option value={UnitOfMeasure.KILOGRAMS}>Kilograms</option>
            <option value={UnitOfMeasure.POUNDS}>Pounds</option>
            <option value={UnitOfMeasure.TONNES}>Tonnes</option>
          </Select>
        </div>
      )}
      {!initial && (
        <Select
          label="Scrapyard"
          value={form.scrapYardId || ''}
          onChange={(e) => setForm({ ...form, scrapYardId: Number(e.target.value) })}
          error={errors.scrapYardId}
        >
          <option value="">Select scrapyard...</option>
          {yards.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </Select>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
