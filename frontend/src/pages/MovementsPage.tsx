import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { movementsApi, type MovementPageParams } from '@/api/endpoints/movements'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { managersApi } from '@/api/endpoints/managers'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Select, Modal, PageHeader, EmptyState, LoadingSpinner, Badge } from '@/components/ui'
import { MaterialType, UnitOfMeasure, MovementType } from '@/types/models'
import type { Movement, MovementFormData, User } from '@/types/models'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const MATERIAL_LABELS: Record<MaterialType, string> = {
  [MaterialType.ALUMINIUM]: 'Aluminum',
  [MaterialType.IRON]: 'Iron',
  [MaterialType.MOTOR]: 'Motor',
  [MaterialType.BATTERY]: 'Battery',
  [MaterialType.STAINLESS_STEEL]: 'Stainless Steel',
  [MaterialType.REFER]: 'Refer',
  [MaterialType.CIRCUIT_BOARD]: 'Circuit',
  [MaterialType.COPPER]: 'Copper',
  [MaterialType.BRASS]: 'Brass',
  [MaterialType.CATALYST]: 'Catalyst',
  [MaterialType.ALUMINIUM_CANS]: 'Aluminum Cans',
}

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.INBOUND]: 'Inbound',
  [MovementType.OUTBOUND]: 'Outbound',
}

const MOVEMENT_TYPE_BADGE: Record<MovementType, 'green' | 'red'> = {
  [MovementType.INBOUND]: 'green',
  [MovementType.OUTBOUND]: 'red',
}

export default function MovementsPage() {
  const queryClient = useQueryClient()
  const { isManager, isSuperAdmin, user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [yardFilter, setYardFilter] = useState('')
  const [page, setPage] = useState(0)

  const params: MovementPageParams = { page, size: 20, sortBy: 'movementDate', direction: 'desc' }

  const { data: movementsPage, isLoading } = useQuery({
    queryKey: ['movements', params],
    queryFn: () => movementsApi.getAll(params),
  })

  const yardsParams: MovementPageParams = { page, size: 20, sortBy: 'movementDate', direction: 'desc' }

  const yardMovementsQuery = useQuery({
    queryKey: ['movements-by-yard', yardFilter, yardsParams],
    queryFn: () => movementsApi.getByYard(Number(yardFilter), yardsParams),
    enabled: !!yardFilter,
  })

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const activeData = yardFilter ? yardMovementsQuery.data : movementsPage
  const displayedMovements = (() => {
    const result: Movement[] = activeData?.content || []
    if (typeFilter) {
      return result.filter((m) => m.movementType === typeFilter)
    }
    return result
  })()
  const totalPages = activeData?.totalPages || 0
  const totalElements = activeData?.totalElements || 0
  const isDataLoading = yardFilter ? yardMovementsQuery.isLoading : isLoading

  if (isDataLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Movements" description="Material movement log">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Movement
        </Button>
      </PageHeader>

      <div className="mb-4 flex gap-3 flex-wrap items-center">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="max-w-[200px]"
        >
          <option value="">All types</option>
          {Object.entries(MOVEMENT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        {isSuperAdmin && (
          <Select
            value={yardFilter}
            onChange={(e) => { setYardFilter(e.target.value); setPage(0) }}
            className="max-w-[250px]"
          >
            <option value="">All scrapyards</option>
            {yards?.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </Select>
        )}
      </div>

      {!displayedMovements.length ? (
        <EmptyState
          title="No movements registered"
          description="Create the first movement to get started"
          action={{ label: 'New Movement', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <>
          <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-50">
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Manager</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Scrapyard</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Container</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Destination</th>
                  <th className="text-right px-6 py-3 font-medium text-secondary-600">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-light">
                {displayedMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-100">
                    <td className="px-6 py-4 text-secondary-600 whitespace-nowrap">
                      {new Date(m.movementDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={MOVEMENT_TYPE_BADGE[m.movementType]}>
                        {MOVEMENT_TYPE_LABELS[m.movementType]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{m.managerName}</td>
                    <td className="px-6 py-4 text-secondary-600">{m.scrapYardName}</td>
                    <td className="px-6 py-4 text-secondary-600">
                      {MATERIAL_LABELS[m.materialType] || m.materialType}
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      #{m.containerId} - {m.containerDescription}
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{m.destination}</td>
                    <td className="px-6 py-4 text-right text-secondary-800 font-medium">
                      {m.amountMoved} {m.unitOfMeasure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-secondary-600">
            <span>
              Showing {displayedMovements.length} of {totalElements} movements
              {yardFilter ? ' (filtered by scrapyard)' : ''}
              {typeFilter ? ' (filtered by type)' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg bg-secondary-50 font-medium">
                Page {page + 1} of {totalPages || 1}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Movement"
        size="lg"
      >
        <MovementForm
          yards={yards || []}
          isManager={isManager}
          user={user}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['movements'] })
            setModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}

function MovementForm({ yards, onSuccess, isManager, user }: {
  yards: { id: number; name: string }[]
  onSuccess: () => void
  isManager: boolean
  user: User | null
}) {
  const initialYardId = isManager && user?.yardId ? user.yardId : 0
  const [form, setForm] = useState({
    scrapYardId: initialYardId,
    containerId: 0,
    destination: '',
    amountMoved: 0,
    unitOfMeasure: UnitOfMeasure.KILOGRAMS,
    materialType: MaterialType.IRON,
    managerId: 0,
    movementType: MovementType.INBOUND,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const { data: yardContainers } = useQuery({
    queryKey: ['yard-containers-move', form.scrapYardId],
    queryFn: () => scrapyardsApi.getContainers(form.scrapYardId),
    enabled: !!form.scrapYardId,
  })

  const { data: yardManagers } = useQuery({
    queryKey: ['yard-managers-move', form.scrapYardId],
    queryFn: () => managersApi.getByYard(form.scrapYardId),
    enabled: !!form.scrapYardId,
  })

  const currentYardName = yards.find((y) => y.id === form.scrapYardId)?.name || ''
  const currentManagerName = yardManagers?.find((m: any) => m.email === user?.email)?.name || ''

  useEffect(() => {
    if (isManager && yardManagers && user?.email && form.managerId === 0) {
      const myManager = yardManagers.find((m: any) => m.email === user.email)
      if (myManager) {
        setForm(prev => ({ ...prev, managerId: myManager.id }))
      }
    }
  }, [isManager, yardManagers, user?.email, form.managerId])

  const saveMutation = useMutation({
    mutationFn: (data: MovementFormData) => movementsApi.create(data),
    onSuccess: onSuccess,
    onError: (err: any) => setError(err.message || 'Error creating the movement'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.scrapYardId) newErrors.scrapYardId = 'Select a scrapyard'
    if (!form.containerId) newErrors.containerId = 'Select a container'
    if (!form.destination.trim()) newErrors.destination = 'Destination required'
    if (!form.amountMoved || form.amountMoved <= 0) newErrors.amountMoved = 'Quantity required'
    if (!form.managerId) newErrors.managerId = 'Select a manager'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    saveMutation.mutate(form as MovementFormData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isManager ? (
          <Select label="Scrapyard" value={form.scrapYardId || ''} disabled>
            <option value={form.scrapYardId || ''}>{currentYardName}</option>
          </Select>
        ) : (
          <Select
            label="Scrapyard"
            value={form.scrapYardId || ''}
            onChange={(e) => {
              setForm({ ...form, scrapYardId: Number(e.target.value), containerId: 0, managerId: 0 })
            }}
            error={errors.scrapYardId}
          >
            <option value="">Select scrapyard...</option>
            {yards.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </Select>
        )}
        <Select
          label="Movement Type"
          value={form.movementType}
          onChange={(e) => setForm({ ...form, movementType: e.target.value as MovementType })}
        >
          <option value={MovementType.INBOUND}>Inbound</option>
          <option value={MovementType.OUTBOUND}>Outbound</option>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Container"
          value={form.containerId || ''}
          onChange={(e) => setForm({ ...form, containerId: Number(e.target.value) })}
          error={errors.containerId}
        >
          <option value="">Select container...</option>
          {yardContainers?.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.id} - {c.description} ({MATERIAL_LABELS[c.materialType] || c.materialType})
            </option>
          ))}
        </Select>
        <Select
          label="Material"
          value={form.materialType}
          onChange={(e) => setForm({ ...form, materialType: e.target.value as MaterialType })}
        >
          {Object.entries(MATERIAL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Quantity"
          type="number"
          step="0.01"
          value={form.amountMoved || ''}
          onChange={(e) => setForm({ ...form, amountMoved: parseFloat(e.target.value) || 0 })}
          error={errors.amountMoved}
          placeholder="0.00"
        />
        <Select
          label="Unit"
          value={form.unitOfMeasure}
          onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value as UnitOfMeasure })}
        >
          <option value={UnitOfMeasure.KILOGRAMS}>Kilograms</option>
          <option value={UnitOfMeasure.POUNDS}>Pounds</option>
          <option value={UnitOfMeasure.TONNES}>Tonnes</option>
        </Select>
        <Input
          label="Destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          error={errors.destination}
          placeholder="Destination location"
        />
      </div>
      {isManager ? (
        <Select label="Manager" value={form.managerId || ''} disabled>
          <option value={form.managerId || ''}>{currentManagerName}</option>
        </Select>
      ) : (
        <Select
          label="Manager"
          value={form.managerId || ''}
          onChange={(e) => setForm({ ...form, managerId: Number(e.target.value) })}
          error={errors.managerId}
        >
          <option value="">Select manager...</option>
          {yardManagers?.map((m: any) => (
            <option key={m.id || m.name} value={m.id}>{m.name}</option>
          ))}
        </Select>
      )}
      {error && <div className="bg-error-50 text-error-600 text-sm rounded-lg px-3 py-2">{error}</div>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Creating...' : 'Create Movement'}
        </Button>
      </div>
    </form>
  )
}
