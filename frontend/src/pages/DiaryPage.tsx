import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi, type ReportPageParams } from '@/api/endpoints/reports'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { managersApi } from '@/api/endpoints/managers'
import { useAuth } from '@/context/AuthContext'
import { PageHeader, Tabs, LoadingSpinner, EmptyState, Badge, Button, Card, Input, Select, ConfirmDialog, ReportPreviewDialog, StatCard } from '@/components/ui'
import { MaterialType } from '@/types/models'
import type { ReportResponse, ReportFormData } from '@/types/models'
import { generateDiaryReportPDF } from '@/utils/pdf'
import { Plus, ChevronLeft, ChevronRight, FileText, DollarSign, ChevronDown, ChevronUp, Search, Package, Trash2, Wallet, Calendar, X, Printer, AlertTriangle } from 'lucide-react'

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

const MATERIAL_COLORS: Record<MaterialType, string> = {
  [MaterialType.ALUMINIUM]: 'bg-slate-100 text-slate-700 border-slate-200',
  [MaterialType.IRON]: 'bg-orange-100 text-orange-700 border-orange-200',
  [MaterialType.MOTOR]: 'bg-red-100 text-red-700 border-red-200',
  [MaterialType.BATTERY]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [MaterialType.STAINLESS_STEEL]: 'bg-gray-100 text-gray-700 border-gray-200',
  [MaterialType.REFER]: 'bg-sky-100 text-sky-700 border-sky-200',
  [MaterialType.CIRCUIT_BOARD]: 'bg-green-100 text-green-700 border-green-200',
  [MaterialType.COPPER]: 'bg-rose-100 text-rose-700 border-rose-200',
  [MaterialType.BRASS]: 'bg-amber-100 text-amber-700 border-amber-200',
  [MaterialType.CATALYST]: 'bg-purple-100 text-purple-700 border-purple-200',
  [MaterialType.ALUMINIUM_CANS]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
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
  const [searchQuery, setSearchQuery] = useState('')
  const [dateMode, setDateMode] = useState<'all' | 'single' | 'range'>('all')
  const [singleDate, setSingleDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const params: ReportPageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const dateFilterActive = (dateMode === 'single' && !!singleDate) || (dateMode === 'range' && !!startDate && !!endDate)

  const { data: reportsPage, isLoading } = useQuery({
    queryKey: ['reports', dateMode, singleDate, startDate, endDate, params],
    queryFn: () => {
      if (dateMode === 'single' && singleDate) return reportsApi.getByDate(singleDate, params)
      if (dateMode === 'range' && startDate && endDate) return reportsApi.getByDateRange(startDate, endDate, params)
      return reportsApi.getAll(params)
    },
    enabled: dateMode === 'all' || dateFilterActive,
  })

  const reports = reportsPage?.content || []
  const totalPages = reportsPage?.totalPages || 0
  const totalElements = reportsPage?.totalElements || 0

  const filteredReports = searchQuery
    ? reports.filter(r => r.managerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : reports

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const clearDateFilter = () => {
    setDateMode('all')
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDateFilterLabel = () => {
    if (dateMode === 'single' && singleDate) return `Showing reports for ${formatDisplayDate(singleDate)}`
    if (dateMode === 'range' && startDate && endDate) return `Showing reports from ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`
    return null
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <StatCard
        title="Total Reports"
        value={totalElements}
        icon={<FileText className="w-5 h-5 text-blue-500" />}
        className="border-l-4 border-l-blue-500 max-w-sm"
      />

      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-outline bg-surface pl-9 pr-4 py-2.5 text-body-md text-secondary-800 placeholder:text-secondary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <Select value={dateMode} onChange={(e) => { setDateMode(e.target.value as 'all' | 'single' | 'range'); setPage(0) }} className="w-auto min-w-[150px]">
          <option value="all">All Dates</option>
          <option value="single">Specific Date</option>
          <option value="range">Date Range</option>
        </Select>

        {dateMode === 'single' && (
          <input
            type="date"
            value={singleDate}
            onChange={(e) => { setSingleDate(e.target.value); setPage(0) }}
            className="rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        )}

        {dateMode === 'range' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0) }}
              className="rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="self-center text-secondary-400 text-sm px-1">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0) }}
              className="rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </>
        )}

        {dateMode !== 'all' && (
          <button
            onClick={clearDateFilter}
            className="flex items-center gap-1 px-3 py-2.5 text-sm text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {dateFilterActive && getDateFilterLabel() && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {getDateFilterLabel()}
          </span>
        </div>
      )}

      {!filteredReports.length ? (
        <EmptyState
          title="No reports found"
          description={searchQuery || dateFilterActive ? 'Try adjusting your filters' : 'Create the first diary report'}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-gradient-to-r from-blue-50 to-transparent">
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
                {filteredReports.map((r, i) => (
                  <>
                    <tr key={i} className="hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => toggleRow(i)}>
                      <td className="px-4 py-4 text-secondary-400">
                        {expandedRows.has(i) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-4 text-secondary-600 whitespace-nowrap font-medium">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-secondary-600">{r.managerName}</td>
                      <td className="px-4 py-4 text-right text-secondary-800">${r.startingBalance?.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-secondary-800">${r.addedMoney?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-4 text-right text-secondary-800 font-semibold">${r.totalInvested?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${(r.balance ?? 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          ${r.balance?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-secondary-600 max-w-[200px] truncate">{r.notes || '-'}</td>
                    </tr>
                    {expandedRows.has(i) && (
                      <tr key={`expanded-${i}`}>
                        <td colSpan={8} className="px-6 py-4 bg-gradient-to-b from-blue-50/50 to-surface">
                          <div className="flex justify-end mb-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); generateDiaryReportPDF(r) }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Report
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            <Card className="p-4 border-l-4 border-l-emerald-500">
                              <h4 className="text-xs font-semibold text-secondary-600 mb-3 flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                                  <Package className="w-3 h-3 text-emerald-600" />
                                </div>
                                Material Details
                              </h4>
                              {r.reportDetails && r.reportDetails.length > 0 ? (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-outline-light">
                                      <th className="text-left py-1.5 font-medium text-secondary-500">Material</th>
                                      <th className="text-right py-1.5 font-medium text-secondary-500">Weight</th>
                                      <th className="text-right py-1.5 font-medium text-secondary-500">Unit Price</th>
                                      <th className="text-right py-1.5 font-medium text-secondary-500">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-light">
                                    {r.reportDetails.map((d, j) => (
                                      <tr key={j}>
                                        <td className="py-1.5">
                                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium border ${MATERIAL_COLORS[d.materialType]}`}>
                                            {MATERIAL_LABELS[d.materialType] || d.materialType}
                                          </span>
                                        </td>
                                        <td className="text-right py-1.5">{d.weight}</td>
                                        <td className="text-right py-1.5">${d.unitPrice?.toFixed(2)}</td>
                                        <td className="text-right py-1.5 font-semibold text-emerald-600">${((d.weight || 0) * (d.unitPrice || 0)).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-secondary-400">No material details</p>
                              )}
                            </Card>
                            <Card className="p-4 border-l-4 border-l-amber-500">
                              <h4 className="text-xs font-semibold text-secondary-600 mb-3 flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center">
                                  <DollarSign className="w-3 h-3 text-amber-600" />
                                </div>
                                Spends
                              </h4>
                              {r.spends && r.spends.length > 0 ? (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-outline-light">
                                      <th className="text-left py-1.5 font-medium text-secondary-500">Description</th>
                                      <th className="text-right py-1.5 font-medium text-secondary-500">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-light">
                                    {r.spends.map((s, j) => (
                                      <tr key={j}>
                                        <td className="py-1.5 text-secondary-600">{s.description}</td>
                                        <td className="text-right py-1.5 font-semibold text-amber-600">${s.amount?.toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-secondary-400">No spends registered</p>
                              )}
      </Card>
      </div>
                          {r.notes && (
                            <Card className="p-4 border-l-4 border-l-blue-500 mt-4">
                              <h4 className="text-xs font-semibold text-secondary-600 mb-2 flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-blue-600" />
                                </div>
                                Notes
                              </h4>
                              <p className="text-sm text-secondary-700 whitespace-pre-wrap">{r.notes}</p>
                            </Card>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>Showing {filteredReports.length} of {totalElements} reports</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-blue-50 font-medium text-blue-700">
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
      )}
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
  const [nextSpendKey, setNextSpendKey] = useState(1)
  const [error, setError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

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

  const { data: existsTodayData } = useQuery({
    queryKey: ['report-exists-today', scrapYardId],
    queryFn: () => reportsApi.existsToday(scrapYardId),
    enabled: !!scrapYardId,
  })

  const reportExistsToday = existsTodayData?.exists ?? false

  useEffect(() => {
    if (isManager && yardManagers && user?.email && managerId === 0) {
      const myManager = yardManagers.find((m: any) => m.email === user.email)
      if (myManager) {
        setManagerId(myManager.id)
      }
    }
  }, [isManager, yardManagers, user?.email, managerId])

  const handleLoadInvoices = async () => {
    if (!scrapYardId) { setError('Select a yard first'); return }
    setError('')
    setIsLoadingData(true)
    try {
      const template = await reportsApi.getTemplateFromInvoices(scrapYardId)
      const newDetails: DetailRow[] = template.reportDetails.map((d, idx) => ({
        key: idx + 1,
        materialType: d.materialType,
        weight: d.weight,
        unitPrice: d.unitPrice,
        containerId: d.containerId,
      }))
      setDetails(newDetails)
      setIsDataLoaded(true)
    } catch (err: any) {
      setError(err.message || 'No invoices found for this date')
      setIsDataLoaded(false)
    } finally {
      setIsLoadingData(false)
    }
  }

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
    if (!isDataLoaded) { setError('Load invoice data first'); return }
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
  const currentManagerName = yardManagers?.find((m: any) => m.id === managerId)?.name || ''
  const detailsTotal = details.reduce((sum, d) => sum + (d.weight || 0) * (d.unitPrice || 0), 0)
  const spendsTotal = spends.reduce((sum, s) => sum + (s.amount || 0), 0)
  const containerMap = (yardContainers || []).reduce((acc: Record<number, string>, c: any) => {
    acc[c.id] = `#${c.id} - ${c.description}`
    return acc
  }, {} as Record<number, string>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
      <Card className={`p-6 border-t-4 ${reportExistsToday ? 'border-t-amber-500 bg-amber-50/50' : 'border-t-blue-500'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${reportExistsToday ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
            {reportExistsToday ? <AlertTriangle className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
          </div>
          <h2 className="text-base font-semibold text-secondary-800">Load Invoice Data</h2>
          {reportExistsToday && <Badge variant="yellow">Today's report exists</Badge>}
          {!reportExistsToday && isDataLoaded && <Badge variant="green">Loaded</Badge>}
          {!reportExistsToday && !isDataLoaded && !isLoadingData && <Badge variant="gray">Required</Badge>}
        </div>
        {reportExistsToday ? (
          <div className="text-center py-4">
            <p className="text-sm text-amber-700 font-medium mb-2">A report has already been created for this yard today.</p>
            <p className="text-xs text-secondary-500">Only one report can be generated per day. Switch to the <span className="font-medium text-blue-600">All Reports</span> tab to view it.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <Button
              onClick={handleLoadInvoices}
              disabled={isLoadingData || !scrapYardId}
              variant="primary"
              loading={isLoadingData}
            >
              {isLoadingData ? 'Loading...' : 'Load Invoice Data'}
            </Button>
          </div>
        )}
      </Card>

      {!reportExistsToday && (
        <>
      <Card className="p-6 border-t-4 border-t-blue-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-secondary-800">Report Info</h2>
        </div>
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
            disabled={!isDataLoaded}
          />
          <Input
            label="Added Money"
            type="number"
            step="0.01"
            value={addedMoney || ''}
            onChange={(e) => setAddedMoney(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={!isDataLoaded}
          />
          <Input
            label="Total Invested"
            type="number"
            step="0.01"
            value={totalInvested || ''}
            onChange={(e) => setTotalInvested(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={!isDataLoaded}
          />
          <Input
            label="Balance"
            type="number"
            step="0.01"
            value={balance || ''}
            onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            disabled={!isDataLoaded}
          />
          <div className="sm:col-span-2">
            <label className="block text-label-md text-secondary-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Report notes..."
              rows={3}
              disabled={!isDataLoaded}
              className="w-full rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 placeholder:text-secondary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none disabled:bg-secondary-50 disabled:text-secondary-400"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-t-4 border-t-emerald-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-secondary-800">Material Details</h2>
          {isDataLoaded && <Badge variant="green">{details.length} lines</Badge>}
        </div>

        {!isDataLoaded ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-400">Load invoice data to populate material details</p>
          </div>
        ) : details.length === 0 ? (
          <p className="text-sm text-secondary-400 text-center py-8">No material details found in invoices</p>
        ) : (
          <div className="overflow-x-auto border border-outline rounded-lg max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-50 z-10">
                <tr className="border-b border-outline">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-secondary-500 w-10">#</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-secondary-500">Material</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-secondary-500">Container</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-secondary-500">Weight</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-secondary-500">Unit Price</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-secondary-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-light">
                {details.map((d, idx) => (
                  <tr key={d.key} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${MATERIAL_COLORS[d.materialType]}`}>
                        {MATERIAL_LABELS[d.materialType]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-secondary-700">
                      {containerMap[d.containerId] || `Container #${d.containerId}`}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-secondary-800">
                      {d.weight}
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-secondary-800">
                      ${d.unitPrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      ${((d.weight || 0) * (d.unitPrice || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isDataLoaded && details.length > 0 && (
          <div className="mt-3 flex justify-end">
            <span className="text-sm font-semibold text-emerald-700">
              Details subtotal: ${detailsTotal.toFixed(2)}
            </span>
          </div>
        )}
      </Card>

      <Card className="p-6 border-t-4 border-t-amber-500">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-secondary-800">Spends</h2>
          {isDataLoaded && spends.length > 0 && <Badge variant="yellow">{spends.length} items</Badge>}
        </div>

        {!isDataLoaded ? (
          <div className="text-center py-8">
            <Wallet className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-400">Load invoice data first to add spends</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <Button size="sm" variant="secondary" onClick={addSpend} className="w-full border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-amber-700">
                <Plus className="w-4 h-4" /> Add Spend
              </Button>
            </div>

            {spends.length === 0 ? (
              <p className="text-sm text-secondary-400 text-center py-8">Add spends for this report</p>
            ) : (
              <div className="overflow-x-auto border border-outline rounded-lg max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-50 z-10">
                    <tr className="border-b border-outline">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-secondary-500 w-10">#</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-secondary-500">Amount</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-secondary-500">Description</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-light">
                    {spends.map((s, idx) => (
                      <tr key={s.key} className="hover:bg-amber-50/50 transition-colors detail-row-enter">
                        <td className="py-3 px-3">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Input
                            type="number"
                            step="0.01"
                            value={s.amount || ''}
                            onChange={(e) => updateSpend(s.key, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="px-2 py-1.5 text-right"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <Input
                            value={s.description}
                            onChange={(e) => updateSpend(s.key, 'description', e.target.value)}
                            placeholder="Spend description"
                            className="px-2 py-1.5"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => removeSpend(s.key)}
                            className="p-1.5 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {spends.length > 0 && (
              <div className="mt-3 flex justify-end">
                <span className="text-sm font-semibold text-amber-700">
                  Spends total: ${spendsTotal.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </Card>
      </>
      )}
      </div>

      {!reportExistsToday && (
      <div>
        <Card className="p-6 sticky top-6 gradient-summary text-white shadow-elevation-4">
          <h3 className="text-sm font-semibold text-white/90 mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Starting Balance</span>
              <span className="font-bold">${startingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">+ Added Money</span>
              <span className="font-bold">${addedMoney.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between text-sm">
              <span className="text-white/70">- Total Invested</span>
              <span className="font-bold">${totalInvested.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between text-lg">
              <span className="text-white/90 font-semibold">= Balance</span>
              <span className="font-bold">{balance <= 0 ? '\u26a0\ufe0f ' : ''}${balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Details</span>
              <span className="font-bold">{details.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Spends</span>
              <span className="font-bold">{spends.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Details Subtotal</span>
              <span className="font-bold">${detailsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Spends Total</span>
              <span className="font-bold">${spendsTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/30 text-white text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending || !isDataLoaded}
            size="lg"
            className="w-full mt-4 !bg-white !text-blue-700 hover:!bg-blue-50 !shadow-lg disabled:!opacity-50"
          >
            {saveMutation.isPending ? 'Creating...' : isDataLoaded ? 'Create Report' : 'Load invoice data first'}
          </Button>
        </Card>
      </div>
      )}

      <ReportPreviewDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmCreate}
        yardName={currentYardName}
        managerName={currentManagerName}
        startingBalance={startingBalance}
        addedMoney={addedMoney}
        totalInvested={totalInvested}
        balance={balance}
        notes={notes}
        details={details}
        spends={spends}
        containerMap={containerMap}
      />
    </div>
  )
}
