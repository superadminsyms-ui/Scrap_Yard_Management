import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/api/endpoints/invoices'
import { customersApi } from '@/api/endpoints/customers'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { managersApi } from '@/api/endpoints/managers'
import { containersApi } from '@/api/endpoints/containers'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Select, Card, ConfirmDialog } from '@/components/ui'
import { MaterialType, UnitOfMeasure, CustomerType } from '@/types/models'
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react'

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

interface DetailRow {
  key: number
  materialType: MaterialType
  unit: UnitOfMeasure
  weight: number
  unitPrice: number
  containerId: number
}

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customerId, setCustomerId] = useState(0)
  const [scrapYardId, setScrapYardId] = useState(0)
  const [managerId, setManagerId] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [details, setDetails] = useState<DetailRow[]>([])
  const [nextKey, setNextKey] = useState(1)
  const [customerSearch, setCustomerSearch] = useState('')
  const [error, setError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { isManager, user } = useAuth()

  useEffect(() => {
    if (isManager && user?.yardId) {
      setScrapYardId(user.yardId)
    }
    if (isManager && user?.id) {
      setManagerId(user.id)
    }
  }, [isManager, user])

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/companies')
      return mod.companiesApi.getAll()
    },
  })

  const { data: allYards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const { data: yardManagers } = useQuery({
    queryKey: ['yard-managers', scrapYardId],
    queryFn: () => managersApi.getByYard(scrapYardId),
    enabled: !!scrapYardId,
  })

  const { data: yardContainers } = useQuery({
    queryKey: ['yard-containers', scrapYardId],
    queryFn: () => scrapyardsApi.getContainers(scrapYardId),
    enabled: !!scrapYardId,
  })

  const { data: searchedCustomers } = useQuery({
    queryKey: ['customer-search', customerSearch],
    queryFn: () => customersApi.searchByName(customerSearch),
    enabled: customerSearch.length >= 2,
  })

  const { data: allCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      invoicesApi.create({
        customerId,
        scrapYardId,
        discount,
        details: details.map(({ key, ...d }) => d),
        managerId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      navigate(`/invoices/${data.invoiceId}`)
    },
    onError: (err: any) => {
      setError(err.message || 'Error creating invoice')
    },
  })

  const addDetail = () => {
    setDetails([
      ...details,
      {
        key: nextKey,
        materialType: MaterialType.IRON,
        unit: UnitOfMeasure.KILOGRAMS,
        weight: 0,
        unitPrice: 0,
        containerId: 0,
      },
    ])
    setNextKey(nextKey + 1)
  }

  const removeDetail = (key: number) => {
    setDetails(details.filter((d) => d.key !== key))
  }

  const updateDetail = (key: number, field: keyof DetailRow, value: any) => {
    setDetails(details.map((d) => (d.key === key ? { ...d, [field]: value } : d)))
  }

  const subtotal = details.reduce((sum, d) => sum + d.weight * d.unitPrice, 0)
  const total = subtotal - (discount || 0)

  const handleSubmit = () => {
    setError('')
    if (!customerId) { setError('Select a customer'); return }
    if (!scrapYardId) { setError('Select a yard'); return }
    if (!isManager && !managerId) { setError('Select a manager'); return }
    if (!details.length) { setError('Add at least one detail'); return }
    for (const d of details) {
      if (!d.containerId) { setError('Complete all details (container required)'); return }
      if (d.weight <= 0) { setError('All weights must be positive'); return }
      if (d.unitPrice <= 0) { setError('All prices must be positive'); return }
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmCreate = () => {
    setShowConfirmDialog(false)
    saveMutation.mutate()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/invoices" className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">New Invoice</h1>
          <p className="text-sm text-secondary-500">Complete the data to create a new invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">Invoice Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Yard"
                  value={scrapYardId || ''}
                  onChange={(e) => {
                    setScrapYardId(Number(e.target.value))
                    setManagerId(0)
                  }}
                  disabled={isManager}
                >
                  <option value="">Select yard...</option>
                  {allYards?.map((y) => (
                    <option key={y.id} value={y.id}>{y.name} - {y.companyName}</option>
                  ))}
                </Select>
              </div>
              {!isManager && (
              <div>
                <Select
                  label="Manager"
                  value={managerId || ''}
                  onChange={(e) => setManagerId(Number(e.target.value))}
                >
                  <option value="">Select manager...</option>
                  {yardManagers?.map((m: any) => (
                    <option key={m.id || m.name} value={m.id}>{m.name}</option>
                  ))}
                </Select>
              </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">Customer</h2>
            <div>
              <Input
                placeholder="Search customer by name..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            {searchedCustomers && searchedCustomers.length > 0 && customerSearch.length >= 2 && (
              <div className="mt-2 border border-outline rounded-lg divide-y divide-outline-light">
                {searchedCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomerId(c.id)
                      setCustomerSearch(c.name)
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-primary-50 flex items-center justify-between ${
                      c.id === customerId ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-secondary-400 text-xs">
                      {c.typeCustomer === CustomerType.REGULAR ? 'Regular' :
                       c.typeCustomer === CustomerType.VIP ? 'VIP' : 'Wholesaler'} &middot; {c.personalId}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {customerId > 0 && (
              <p className="mt-2 text-sm text-success-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Customer selected: {customerSearch}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-secondary-800">Invoice Details</h2>
              <Button size="sm" variant="secondary" onClick={addDetail}>
                <Plus className="w-3 h-3" /> Add line
              </Button>
            </div>

            {!details.length ? (
              <p className="text-sm text-secondary-400 text-center py-6">
                Add detail lines for this invoice
              </p>
            ) : (
              <div className="space-y-4">
                {details.map((d) => (
                  <div key={d.key} className="border border-outline rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-secondary-500">Line #{d.key}</span>
                      <button
                        onClick={() => removeDetail(d.key)}
                        className="p-1 text-secondary-400 hover:text-error-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        value={d.materialType}
                        onChange={(e) => updateDetail(d.key, 'materialType', e.target.value)}
                        label="Material"
                      >
                        {Object.entries(MATERIAL_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </Select>
                      <Select
                        value={d.unit}
                        onChange={(e) => updateDetail(d.key, 'unit', e.target.value)}
                        label="Unit"
                      >
                        <option value={UnitOfMeasure.KILOGRAMS}>Kilograms</option>
                        <option value={UnitOfMeasure.POUNDS}>Pounds</option>
                        <option value={UnitOfMeasure.TONNES}>Tonnes</option>
                      </Select>
                      <Input
                        label="Weight"
                        type="number"
                        step="0.01"
                        value={d.weight || ''}
                        onChange={(e) => updateDetail(d.key, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <Input
                        label="Unit Price"
                        type="number"
                        step="0.01"
                        value={d.unitPrice || ''}
                        onChange={(e) => updateDetail(d.key, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <Select
                        value={d.containerId || ''}
                        onChange={(e) => updateDetail(d.key, 'containerId', Number(e.target.value))}
                        label="Container"
                        className="col-span-2"
                      >
                        <option value="">Select container...</option>
                        {yardContainers?.map((c) => (
                          <option key={c.id} value={c.id}>
                            #{c.id} - {c.description} ({MATERIAL_LABELS[c.materialType] || c.materialType})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <p className="text-right text-sm font-medium text-secondary-600">
                      Subtotal: ${(d.weight * d.unitPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 sm:sticky sm:top-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Lines</span>
                <span className="font-medium">{details.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500">Discount</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-32"
                  placeholder="0.00"
                />
              </div>
              <div className="border-t border-outline pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {error && (
                <div className="bg-error-50 text-error-600 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmCreate}
        title="Confirm Invoice Creation"
        message="You are about to create a new invoice. Please review all data carefully as this is an irreversible operation."
        confirmLabel="Confirm"
        variant="primary"
      />
    </div>
  )
}
