import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi, type ReportPageParams } from '@/api/endpoints/reports'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { managersApi } from '@/api/endpoints/managers'
import { useAuth } from '@/context/AuthContext'
import { PageHeader, Tabs, LoadingSpinner, EmptyState, Badge, Button, Card, Input, Select, ConfirmDialog } from '@/components/ui'
import { MaterialType } from '@/types/models'
import type { ReportResponse, ReportFormData } from '@/types/models'
import { Plus, ChevronLeft, ChevronRight, FileText, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function DiaryPage() {
  const { isManager, user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { key: 'all', label: 'All Reports' },
    { key: 'new', label: 'New Report' },
  ]

  return (
    <div>
      <PageHeader title="Diary" description="Daily report management" />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'all' && <AllReportsTab />}
        {activeTab === 'new' && (
          <NewReportTab
            isManager={isManager}
            user={user}
            onSuccess={() => setActiveTab('all')}
          />
        )}
      </Tabs>
    </div>
  )
}

function AllReportsTab() {
  const [page, setPage] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const params: ReportPageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const { data: reportsPage, isLoading } = useQuery({
    queryKey: ['reports', params],
    queryFn: () => reportsApi.getAll(params),
  })

  const reports = reportsPage?.content || []
  const totalPages = reportsPage?.totalPages || 0
  const totalElements = reportsPage?.totalElements || 0

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  if (isLoading) return <LoadingSpinner />

  if (!reports.length) {
    return (
      <EmptyState
        title="No reports registered"
        description="Create the first diary report"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-50">
              <th className="text-left px-4 py-3 font-medium text-secondary-600 w-8"></th>
              <th className="text-left px-4 py-3 font-medium text-secondary-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-secondary-600">Manager</th>
              <th className="text-right px-4 py-3 font-medium text-secondary-600">Start Balance</th>
              <th className="text-right px-4 py-3 font-medium text-secondary-600">Added</th>
              <th className="text-right px-4 py-3 font-medium text-secondary-600">Total Invested</th>
              <th className="text-right px-4 py-3 font-medium text-secondary-600">Balance</th>
              <th className="text-left px-4 py-3 font-medium text-secondary-600">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-light">
            {reports.map((r, i) => (
              <>
                <tr key={i} className="hover:bg-surface-100 cursor-pointer" onClick={() => toggleRow(i)}>
                  <td className="px-4 py-4">
                    {expandedRows.has(i) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-4 text-secondary-600 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-secondary-600">{r.managerName}</td>
                  <td className="px-4 py-4 text-right text-secondary-800">${r.startingBalance?.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right text-secondary-800">${r.addedMoney?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-4 text-right text-secondary-800 font-medium">${r.totalInvested?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-4 text-right text-secondary-800 font-medium">${r.balance?.toFixed(2)}</td>
                  <td className="px-4 py-4 text-secondary-600 max-w-[200px] truncate">{r.notes || '-'}</td>
                </tr>
                {expandedRows.has(i) && (
                  <tr key={`expanded-${i}`}>
                    <td colSpan={8} className="px-6 py-4 bg-surface-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h4 className="text-xs font-semibold text-secondary-600 mb-2 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Material Details
                          </h4>
                          {r.reportDetails && r.reportDetails.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-outline-light">
                                  <th className="text-left py-1 font-medium text-secondary-500">Material</th>
                                  <th className="text-right py-1 font-medium text-secondary-500">Weight</th>
                                  <th className="text-right py-1 font-medium text-secondary-500">Unit Price</th>
                                  <th className="text-right py-1 font-medium text-secondary-500">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-light">
                                {r.reportDetails.map((d, j) => (
                                  <tr key={j}>
                                    <td className="py-1">
                                      <Badge variant="blue" className="text-xs">{MATERIAL_LABELS[d.materialType] || d.materialType}</Badge>
                                    </td>
                                    <td className="text-right py-1">{d.weight}</td>
                                    <td className="text-right py-1">${d.unitPrice?.toFixed(2)}</td>
                                    <td className="text-right py-1 font-medium">${((d.weight || 0) * (d.unitPrice || 0)).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-xs text-secondary-400">No material details</p>
                          )}
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-xs font-semibold text-secondary-600 mb-2 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> Spends
                          </h4>
                          {r.spends && r.spends.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-outline-light">
                                  <th className="text-left py-1 font-medium text-secondary-500">Description</th>
                                  <th className="text-right py-1 font-medium text-secondary-500">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-light">
                                {r.spends.map((s, j) => (
                                  <tr key={j}>
                                    <td className="py-1 text-secondary-600">{s.description}</td>
                                    <td className="text-right py-1 font-medium">${s.amount?.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-xs text-secondary-400">No spends registered</p>
                          )}
                        </Card>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-secondary-600">
        <span>Showing {reports.length} of {totalElements} reports</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-secondary-50 font-medium">
            Page {page + 1} of {totalPages || 1}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface DetailRow {
  key: number
  materialType: MaterialType
  weight: number
  unitPrice: number
  containerId: number
}

interface SpendRow {
  key: number
  amount: number
  description: string
}

function NewReportTab({ isManager, user, onSuccess }: {
  isManager: boolean
  user: any
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()
  const initialYardId = isManager && user?.yardId ? user.yardId : 0

  const [scrapYardId, setScrapYardId] = useState(initialYardId)
  const [managerId, setManagerId] = useState(0)
  const [startingBalance, setStartingBalance] = useState(0)
  const [addedMoney, setAddedMoney] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [balance, setBalance] = useState(0)
  const [notes, setNotes] = useState('')
  const [details, setDetails] = useState<DetailRow[]>([])
  const [spends, setSpends] = useState<SpendRow[]>([])
  const [nextDetailKey, setNextDetailKey] = useState(1)
  const [nextSpendKey, setNextSpendKey] = useState(1)
  const [error, setError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const { data: yardManagers } = useQuery({
    queryKey: ['yard-managers-report', scrapYardId],
    queryFn: () => managersApi.getByYard(scrapYardId),
    enabled: !!scrapYardId,
  })

  const { data: yardContainers } = useQuery({
    queryKey: ['yard-containers-report', scrapYardId],
    queryFn: () => scrapyardsApi.getContainers(scrapYardId),
    enabled: !!scrapYardId,
  })

  useEffect(() => {
    if (isManager && yardManagers && user?.email && managerId === 0) {
      const myManager = yardManagers.find((m: any) => m.email === user.email)
      if (myManager) {
        setManagerId(myManager.id)
      }
    }
  }, [isManager, yardManagers, user?.email, managerId])

  const saveMutation = useMutation({
    mutationFn: () => {
      const data: ReportFormData = {
        scrapYardId,
        managerId,
        startingBalance,
        addedMoney,
        totalInvested,
        balance,
        reportDetails: details.map(({ key, ...d }) => d),
        spends: spends.map(({ key, ...s }) => s),
        notes,
      }
      return reportsApi.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      onSuccess()
    },
    onError: (err: any) => {
      setError(err.message || 'Error creating report')
    },
  })

  const addDetail = () => {
    setDetails([
      ...details,
      { key: nextDetailKey, materialType: MaterialType.IRON, weight: 0, unitPrice: 0, containerId: 0 },
    ])
    setNextDetailKey(nextDetailKey + 1)
  }

  const removeDetail = (key: number) => {
    setDetails(details.filter(d => d.key !== key))
  }

  const updateDetail = (key: number, field: keyof DetailRow, value: any) => {
    setDetails(details.map(d => (d.key === key ? { ...d, [field]: value } : d)))
  }

  const addSpend = () => {
    setSpends([
      ...spends,
      { key: nextSpendKey, amount: 0, description: '' },
    ])
    setNextSpendKey(nextSpendKey + 1)
  }

  const removeSpend = (key: number) => {
    setSpends(spends.filter(s => s.key !== key))
  }

  const updateSpend = (key: number, field: keyof SpendRow, value: any) => {
    setSpends(spends.map(s => (s.key === key ? { ...s, [field]: value } : s)))
  }

  const handleSubmit = () => {
    setError('')
    if (!scrapYardId) { setError('Select a yard'); return }
    if (!managerId) { setError('Select a manager'); return }
    if (totalInvested <= 0) { setError('Total invested must be positive'); return }
    if (balance <= 0) { setError('Balance must be positive'); return }
    if (!details.length) { setError('Add at least one material detail'); return }
    for (const d of details) {
      if (!d.containerId) { setError('Complete all material details (container required)'); return }
      if (d.weight <= 0) { setError('All weights must be positive'); return }
      if (d.unitPrice <= 0) { setError('All prices must be positive'); return }
    }
    for (const s of spends) {
      if (!s.description.trim()) { setError('All spends must have a description'); return }
      if (s.amount <= 0) { setError('All spend amounts must be positive'); return }
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmCreate = () => {
    setShowConfirmDialog(false)
    saveMutation.mutate()
  }

  const currentYardName = yards?.find(y => y.id === scrapYardId)?.name || ''

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-secondary-800 mb-4">Report Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isManager ? (
              <Select label="Yard" value={scrapYardId || ''} disabled>
                <option value={scrapYardId || ''}>{currentYardName}</option>
              </Select>
            ) : (
              <Select
                label="Yard"
                value={scrapYardId || ''}
                onChange={(e) => { setScrapYardId(Number(e.target.value)); setManagerId(0) }}
              >
                <option value="">Select yard...</option>
                {yards?.map(y => (
                  <option key={y.id} value={y.id}>{y.name} - {y.companyName}</option>
                ))}
              </Select>
            )}
            {isManager ? (
              <Select label="Manager" value={managerId || ''} disabled>
                <option value={managerId || ''}>
                  {yardManagers?.find((m: any) => m.id === managerId)?.name || ''}
                </option>
              </Select>
            ) : (
              <Select
                label="Manager"
                value={managerId || ''}
                onChange={(e) => setManagerId(Number(e.target.value))}
              >
                <option value="">Select manager...</option>
                {yardManagers?.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            )}
            <Input
              label="Starting Balance"
              type="number"
              step="0.01"
              value={startingBalance || ''}
              onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input
              label="Added Money"
              type="number"
              step="0.01"
              value={addedMoney || ''}
              onChange={(e) => setAddedMoney(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input
              label="Total Invested"
              type="number"
              step="0.01"
              value={totalInvested || ''}
              onChange={(e) => setTotalInvested(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input
              label="Balance"
              type="number"
              step="0.01"
              value={balance || ''}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <div className="sm:col-span-2">
              <Input
                label="Notes"
                type="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Report notes..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary-800">Material Details</h2>
            <Button size="sm" variant="secondary" onClick={addDetail}>
              <Plus className="w-3 h-3" /> Add line
            </Button>
          </div>
          {!details.length ? (
            <p className="text-sm text-secondary-400 text-center py-6">Add material details for this report</p>
          ) : (
            <div className="space-y-4">
              {details.map(d => (
                <div key={d.key} className="border border-outline rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-secondary-500">Line #{d.key}</span>
                    <button
                      onClick={() => removeDetail(d.key)}
                      className="p-1 text-secondary-400 hover:text-error-500 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
                    >
                      <option value="">Select container...</option>
                      {yardContainers?.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          #{c.id} - {c.description} ({MATERIAL_LABELS[c.materialType] || c.materialType})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <p className="text-right text-sm font-medium text-secondary-600">
                    Subtotal: ${((d.weight || 0) * (d.unitPrice || 0)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary-800">Spends</h2>
            <Button size="sm" variant="secondary" onClick={addSpend}>
              <Plus className="w-3 h-3" /> Add spend
            </Button>
          </div>
          {!spends.length ? (
            <p className="text-sm text-secondary-400 text-center py-6">Add spends for this report</p>
          ) : (
            <div className="space-y-4">
              {spends.map(s => (
                <div key={s.key} className="border border-outline rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-secondary-500">Spend #{s.key}</span>
                    <button
                      onClick={() => removeSpend(s.key)}
                      className="p-1 text-secondary-400 hover:text-error-500 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.amount || ''}
                      onChange={(e) => updateSpend(s.key, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    <Input
                      value={s.description}
                      onChange={(e) => updateSpend(s.key, 'description', e.target.value)}
                      placeholder="Spend description"
                    />
                  </div>
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
              <span className="text-secondary-500">Details</span>
              <span className="font-medium">{details.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Spends</span>
              <span className="font-medium">{spends.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Starting Balance</span>
              <span className="font-medium">${startingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Added Money</span>
              <span className="font-medium">${addedMoney.toFixed(2)}</span>
            </div>
            <div className="border-t border-outline pt-3 flex justify-between text-lg font-bold">
              <span>Total Invested</span>
              <span>${totalInvested.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-500">Balance</span>
              <span className="font-medium">${balance.toFixed(2)}</span>
            </div>
            {error && (
              <div className="bg-error-50 text-error-600 text-sm rounded-lg px-3 py-2">{error}</div>
            )}
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Creating...' : 'Create Report'}
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmCreate}
        title="Confirm Report Creation"
        message="You are about to create a new report. Please review all data carefully as this is an irreversible operation."
        confirmLabel="Confirm"
        variant="primary"
      />
    </div>
  )
}
