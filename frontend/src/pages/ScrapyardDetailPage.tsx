import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { invoicesApi, type InvoicePageParams } from '@/api/endpoints/invoices'
import { reportsApi, type ReportPageParams } from '@/api/endpoints/reports'
import { cashFlowApi, type CashFlowPageParams } from '@/api/endpoints/cashflow'
import { PageHeader, Tabs, LoadingSpinner, EmptyState, Badge, StatCard, Card, Button, Select } from '@/components/ui'
import { MaterialType, MovementType, ReportPeriod } from '@/types/models'
import type { Container, InvoiceSummary, Movement, MaterialStockItem, ContainerStockItem, YardStockSummary, ScrapyardReport, MaterialPricing, ReportResponse, CashFlowResponse } from '@/types/models'
import { generateDiaryReportPDF } from '@/utils/pdf'
import { ArrowLeft, Package, Scale, TrendingUp, Receipt, FileDown, ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp, Search, X, DollarSign, Printer, Calendar, Wallet } from 'lucide-react'

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

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.INBOUND]: 'Inbound',
  [MovementType.OUTBOUND]: 'Outbound',
  [MovementType.TRANSFER]: 'Transfer',
}

export default function ScrapyardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const yardId = Number(id)
  const [activeTab, setActiveTab] = useState('containers')
  const [invPage, setInvPage] = useState(0)

  const yardQuery = useQuery({
    queryKey: ['scrapyard', yardId],
    queryFn: () => scrapyardsApi.getById(yardId),
  })

  const containersQuery = useQuery({
    queryKey: ['scrapyard-containers', yardId],
    queryFn: () => scrapyardsApi.getContainers(yardId),
    enabled: activeTab === 'containers',
  })

  const stockTotalQuery = useQuery({
    queryKey: ['scrapyard-stock', yardId],
    queryFn: () => scrapyardsApi.getStock(yardId),
    enabled: activeTab === 'stock',
  })

  const stockContainersQuery = useQuery({
    queryKey: ['scrapyard-stock-containers', yardId],
    queryFn: () => scrapyardsApi.getStockByContainers(yardId),
    enabled: activeTab === 'stock',
  })

  const invParams: InvoicePageParams = { page: invPage, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const movementsQuery = useQuery({
    queryKey: ['scrapyard-movements', yardId],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/movements')
      return mod.movementsApi.getByYard(yardId, { page: 0, size: 1000 })
    },
    enabled: activeTab === 'movements',
    select: (data) => data.content,
  })

  const invoicesQuery = useQuery({
    queryKey: ['scrapyard-invoices', yardId, invParams],
    queryFn: () => invoicesApi.getByYard(yardId, invParams),
    enabled: activeTab === 'invoices',
  })

  const resumeQuery = useQuery({
    queryKey: ['scrapyard-resume', yardId],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/invoices')
      return mod.invoicesApi.getByYard(yardId)
    },
    enabled: activeTab === 'resume',
    select: (data) => data.content,
  })

  const [reportType, setReportType] = useState('PURCHASES')
  const [reportPeriod, setReportPeriod] = useState('MONTHLY')

  const [diaryPage, setDiaryPage] = useState(0)
  const [diaryDateMode, setDiaryDateMode] = useState<'all' | 'single' | 'range'>('all')
  const [diarySingleDate, setDiarySingleDate] = useState('')
  const [diaryStartDate, setDiaryStartDate] = useState('')
  const [diaryEndDate, setDiaryEndDate] = useState('')
  const [diarySubTab, setDiarySubTab] = useState<'reports' | 'cashflow'>('reports')
  const [cfPage, setCfPage] = useState(0)

  const diaryParams: ReportPageParams = { page: diaryPage, size: 20, sortBy: 'createdAt', direction: 'desc' }
  const diaryDateFilterActive = (diaryDateMode === 'single' && !!diarySingleDate) || (diaryDateMode === 'range' && !!diaryStartDate && !!diaryEndDate)

  const diaryQuery = useQuery({
    queryKey: ['scrapyard-diary', yardId, diaryDateMode, diarySingleDate, diaryStartDate, diaryEndDate, diaryParams],
    queryFn: () => {
      if (diaryDateMode === 'single' && diarySingleDate) return reportsApi.getByYardDateRange(yardId, diarySingleDate, diarySingleDate, diaryParams)
      if (diaryDateMode === 'range' && diaryStartDate && diaryEndDate) return reportsApi.getByYardDateRange(yardId, diaryStartDate, diaryEndDate, diaryParams)
      return reportsApi.getByYard(yardId, diaryParams)
    },
    enabled: activeTab === 'diary',
  })

  const cfParams: CashFlowPageParams = { page: cfPage, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const cashFlowQuery = useQuery({
    queryKey: ['cashflows-yard', yardId, cfParams],
    queryFn: () => cashFlowApi.getByYard(yardId, cfParams),
    enabled: activeTab === 'diary' && diarySubTab === 'cashflow',
  })

  const reportQuery = useQuery({
    queryKey: ['scrapyard-report', yardId, reportType, reportPeriod],
    queryFn: () => scrapyardsApi.getReport(yardId, reportType, reportPeriod),
    enabled: activeTab === 'reports',
  })

  const tabs = [
    { key: 'containers', label: 'Containers' },
    { key: 'stock', label: 'Stock' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'movements', label: 'Movements' },
    { key: 'resume', label: 'Resume' },
    { key: 'reports', label: 'Statistics' },
    { key: 'diary', label: 'Diary' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/scrapyards" className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">
            {yardQuery.data?.name || 'Loading...'}
          </h1>
          <p className="text-sm text-secondary-500">
            {yardQuery.data?.companyName} &middot; {yardQuery.data?.location}
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'containers' && (
          <ContainersTab
            data={containersQuery.data}
            isLoading={containersQuery.isLoading}
          />
        )}
        {activeTab === 'stock' && (
          <StockTab
            total={stockTotalQuery.data}
            containers={stockContainersQuery.data}
            isLoading={stockTotalQuery.isLoading}
          />
        )}
        {activeTab === 'invoices' && (
          <InvoicesTab
            data={invoicesQuery.data}
            isLoading={invoicesQuery.isLoading}
            page={invPage}
            totalPages={invoicesQuery.data?.totalPages || 0}
            totalElements={invoicesQuery.data?.totalElements || 0}
            onPageChange={setInvPage}
          />
        )}
        {activeTab === 'movements' && (
          <MovementsTab
            data={movementsQuery.data}
            isLoading={movementsQuery.isLoading}
          />
        )}
        {activeTab === 'resume' && (
          <ResumeTab
            data={resumeQuery.data}
            isLoading={resumeQuery.isLoading}
          />
        )}
        {activeTab === 'reports' && (
          <ReportsTab
            data={reportQuery.data}
            isLoading={reportQuery.isLoading}
            reportType={reportType}
            reportPeriod={reportPeriod}
            onReportTypeChange={setReportType}
            onReportPeriodChange={setReportPeriod}
          />
        )}
        {activeTab === 'diary' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setDiarySubTab('reports'); setDiaryPage(0) }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  diarySubTab === 'reports'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-surface text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 border border-outline'
                }`}
              >
                <FileText className="w-4 h-4" /> Total Reports
              </button>
              <button
                onClick={() => { setDiarySubTab('cashflow'); setCfPage(0) }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  diarySubTab === 'cashflow'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-surface text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 border border-outline'
                }`}
              >
                <Wallet className="w-4 h-4" /> Total CashFlows
              </button>
            </div>

            {diarySubTab === 'reports' && (
              <DiaryTab
                data={diaryQuery.data}
                isLoading={diaryQuery.isLoading}
                page={diaryPage}
                dateMode={diaryDateMode}
                singleDate={diarySingleDate}
                startDate={diaryStartDate}
                endDate={diaryEndDate}
                dateFilterActive={diaryDateFilterActive}
                onPageChange={setDiaryPage}
                onDateModeChange={setDiaryDateMode}
                onSingleDateChange={setDiarySingleDate}
                onStartDateChange={setDiaryStartDate}
                onEndDateChange={setDiaryEndDate}
              />
            )}
            {diarySubTab === 'cashflow' && (
              <YardCashFlowTab
                data={cashFlowQuery.data}
                isLoading={cashFlowQuery.isLoading}
                page={cfPage}
                onPageChange={setCfPage}
              />
            )}
          </div>
        )}
      </Tabs>
    </div>
  )
}

function ContainersTab({ data, isLoading }: { data: Container[] | undefined; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title="No containers in this scrapyard" />
  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline bg-surface-50">
            <th className="text-left px-6 py-3 font-medium text-secondary-600">ID</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Description</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Size</th>
            <th className="text-right px-6 py-3 font-medium text-secondary-600">Weight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-light">
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-surface-100">
              <td className="px-6 py-4 font-medium text-secondary-800">#{c.id}</td>
              <td className="px-6 py-4 text-secondary-600">{c.description}</td>
              <td className="px-6 py-4 text-secondary-600">{MATERIAL_LABELS[c.materialType] || c.materialType}</td>
              <td className="px-6 py-4 text-secondary-600">{c.containerSize}</td>
              <td className="px-6 py-4 text-right text-secondary-800 font-medium">
                {c.materialWeight ?? '-'} {c.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StockTab({
  total,
  containers,
  isLoading,
}: {
  total: YardStockSummary | undefined
  containers: ContainerStockItem[] | undefined
  isLoading: boolean
}) {
  if (isLoading) return <LoadingSpinner />
  if (!total) return <EmptyState title="No stock data available" />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Weight"
          value={`${total.totalWeight?.toFixed(2) ?? '0'} ${total.weightUnit}`}
          icon={<Scale className="w-5 h-5" />}
        />
        <StatCard
          title="Containers"
          value={total.containerCount ?? 0}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="Materials"
          value={total.materialBreakdown?.length ?? 0}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {total.materialBreakdown?.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-secondary-800 mb-4">Breakdown by Material</h3>
          <div className="space-y-3">
            {total.materialBreakdown.map((m: MaterialStockItem, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-outline-light last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{MATERIAL_LABELS[m.materialType] || m.materialType}</Badge>
                  <span className="text-xs text-secondary-500">{m.containerCount} containers</span>
                </div>
                <span className="text-sm font-medium text-secondary-800">
                  {m.totalWeight?.toFixed(2)} {m.weightUnit}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {containers && containers.length > 0 && (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Container</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Size</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {containers.map((c: ContainerStockItem, i: number) => (
                <tr key={i} className="hover:bg-surface-100">
                  <td className="px-6 py-4 font-medium text-secondary-800">{c.description}</td>
                  <td className="px-6 py-4 text-secondary-600">{MATERIAL_LABELS[c.materialType] || c.materialType}</td>
                  <td className="px-6 py-4 text-secondary-600">{c.containerSize}</td>
                  <td className="px-6 py-4 text-right text-secondary-800 font-medium">
                    {c.materialWeight?.toFixed(2)} {c.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InvoicesTab({
  data,
  isLoading,
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  data: InvoiceSummary[] | undefined | { content: InvoiceSummary[]; totalPages: number; totalElements: number }
  isLoading: boolean
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (p: number) => void
}) {
  const invoices: InvoiceSummary[] = (data as { content?: InvoiceSummary[] })?.content
    ? (data as { content: InvoiceSummary[] }).content
    : (data as InvoiceSummary[]) || []
  if (isLoading) return <LoadingSpinner />
  if (!invoices.length) return <EmptyState title="No invoices in this scrapyard" />
  return (
    <>
      <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline bg-surface-50">
              <th className="text-left px-6 py-3 font-medium text-secondary-600"># Invoice</th>
              <th className="text-left px-6 py-3 font-medium text-secondary-600">Customer</th>
              <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
              <th className="text-right px-6 py-3 font-medium text-secondary-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-light">
            {invoices.map((inv) => (
              <tr key={inv.invoiceId} className="hover:bg-surface-100">
                <td className="px-6 py-4 font-medium text-secondary-800">#{inv.invoiceId}</td>
                <td className="px-6 py-4 text-secondary-600">{inv.customerName}</td>
                <td className="px-6 py-4 text-secondary-600">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-secondary-800">
                  ${inv.totalPaid?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-secondary-600">
          <span>
            Showing {invoices.length} of {totalElements} invoices
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

function YardCashFlowTab({
  data,
  isLoading,
  page,
  onPageChange,
}: {
  data: { content: CashFlowResponse[]; totalPages: number; totalElements: number } | undefined
  isLoading: boolean
  page: number
  onPageChange: (p: number) => void
}) {
  const cashFlows = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <StatCard
        title="Total CashFlows"
        value={totalElements}
        icon={<Wallet className="w-5 h-5 text-emerald-500" />}
        className="border-l-4 border-l-emerald-500 max-w-sm"
      />

      {!cashFlows.length ? (
        <EmptyState
          title="No cash flows found"
          description="No cash flow entries for this yard yet"
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-gradient-to-r from-emerald-50 to-transparent">
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Manager</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Start Balance</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Cash Received</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">From</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Total Spent</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-light">
                {cashFlows.map((cf) => (
                  <tr key={cf.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-4 text-secondary-600 whitespace-nowrap font-medium">
                      {new Date(cf.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-secondary-600">{cf.managerName}</td>
                    <td className="px-4 py-4 text-right text-secondary-800">${cf.startingBalance?.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-secondary-800">${cf.cashReceived?.toFixed(2)}</td>
                    <td className="px-4 py-4 text-secondary-600 max-w-[250px] truncate" title={cf.cashReceivedFrom}>{cf.cashReceivedFrom || '--'}</td>
                    <td className="px-4 py-4 text-right text-secondary-800">${cf.totalSpendInDay?.toFixed(2)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cf.totalBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        ${cf.totalBalance?.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>Showing {cashFlows.length} of {totalElements} cash flows</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-emerald-50 font-medium text-emerald-700">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
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

function MovementsTab({ data, isLoading }: { data: Movement[] | undefined; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title="No movements registered" />
  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline bg-surface-50">
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Type</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Manager</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
            <th className="text-left px-6 py-3 font-medium text-secondary-600">Destination</th>
            <th className="text-right px-6 py-3 font-medium text-secondary-600">Quantity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-light">
          {[...(data || [])].sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()).map((m) => (
            <tr key={m.id} className="hover:bg-surface-100">
              <td className="px-6 py-4 text-secondary-600">
                {new Date(m.movementDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    m.movementType === MovementType.INBOUND ? 'green' :
                    m.movementType === MovementType.OUTBOUND ? 'red' : 'blue'
                  }
                >
                  {MOVEMENT_TYPE_LABELS[m.movementType] || m.movementType}
                </Badge>
              </td>
              <td className="px-6 py-4 text-secondary-600">{m.managerName}</td>
              <td className="px-6 py-4 text-secondary-600">{MATERIAL_LABELS[m.materialType] || m.materialType}</td>
              <td className="px-6 py-4 text-secondary-600">{m.destination}</td>
              <td className="px-6 py-4 text-right text-secondary-800 font-medium">
                {m.amountMoved} {m.unitOfMeasure}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResumeTab({ data, isLoading }: { data: InvoiceSummary[] | undefined; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title="No invoices in this scrapyard" />

  const totalSpent = data.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Invested"
          value={`$${totalSpent.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Invoices"
          value={data.length}
          icon={<Receipt className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}

function ReportsTab({
  data,
  isLoading,
  reportType,
  reportPeriod,
  onReportTypeChange,
  onReportPeriodChange,
}: {
  data: ScrapyardReport | undefined
  isLoading: boolean
  reportType: string
  reportPeriod: string
  onReportTypeChange: (v: string) => void
  onReportPeriodChange: (v: string) => void
}) {
  const handleExportPDF = async () => {
    if (!data) return
    const { generateReportPDF } = await import('@/utils/pdf')
    generateReportPDF(data)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={reportType} onChange={(e) => onReportTypeChange(e.target.value)} className="max-w-[180px]">
          <option value="PURCHASES">Purchases</option>
          <option value="PRICING">Material Pricing</option>
        </Select>
        <Select value={reportPeriod} onChange={(e) => onReportPeriodChange(e.target.value)} className="max-w-[180px]">
          {Object.values(ReportPeriod).map((p) => (
            <option key={p} value={p}>
              {p === 'WEEKLY' ? 'Weekly' : p === 'MONTHLY' ? 'Monthly' : p === 'QUARTERLY' ? 'Quarterly' : 'Semi-Annual'}
            </option>
          ))}
        </Select>
        <Button onClick={handleExportPDF} disabled={!data}>
          <FileDown className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      {!data ? (
        <EmptyState title="No data" description="Select a report type and period" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Invested"
              value={`$${(data.totalInvested || 0).toFixed(2)}`}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              title="Invoices"
              value={data.invoiceCount ?? 0}
              icon={<Receipt className="w-5 h-5" />}
            />
            <StatCard
              title="Period"
              value={`${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}`}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>

          {reportType === 'PURCHASES' && data.invoices && data.invoices.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Invoices in Period</h3>
              <div className="bg-surface rounded-2xl border border-outline overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline bg-surface-50">
                      <th className="text-left px-6 py-3 font-medium text-secondary-600"># Invoice</th>
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">Customer</th>
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
                      <th className="text-right px-6 py-3 font-medium text-secondary-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-light">
                    {data.invoices.map((inv) => (
                      <tr key={inv.invoiceId} className="hover:bg-surface-100">
                        <td className="px-6 py-4 font-medium text-secondary-800">#{inv.invoiceId}</td>
                        <td className="px-6 py-4 text-secondary-600">{inv.customerName}</td>
                        <td className="px-6 py-4 text-secondary-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-medium text-secondary-800">${inv.totalPaid?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {reportType === 'PRICING' && data.materialPricing && data.materialPricing.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Material Pricing Breakdown</h3>
              <div className="bg-surface rounded-2xl border border-outline overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline bg-surface-50">
                      <th className="text-left px-6 py-3 font-medium text-secondary-600">Material</th>
                      <th className="text-right px-6 py-3 font-medium text-secondary-600">Total Weight (lbs)</th>
                      <th className="text-right px-6 py-3 font-medium text-secondary-600">Total Spent</th>
                      <th className="text-right px-6 py-3 font-medium text-secondary-600">Avg Unit Price</th>
                      <th className="text-right px-6 py-3 font-medium text-secondary-600">Lines</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-light">
                    {data.materialPricing.map((mp, i) => (
                      <tr key={i} className="hover:bg-surface-100">
                        <td className="px-6 py-4">
                          <Badge variant="blue">{MATERIAL_LABELS[mp.materialType] || mp.materialType}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-secondary-800 font-medium">{mp.totalWeight?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-secondary-800">${mp.totalSpent?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-secondary-800">${mp.averageUnitPrice?.toFixed(4)}</td>
                        <td className="px-6 py-4 text-right text-secondary-600">{mp.lineCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function DiaryTab({
  data,
  isLoading,
  page,
  dateMode,
  singleDate,
  startDate,
  endDate,
  dateFilterActive,
  onPageChange,
  onDateModeChange,
  onSingleDateChange,
  onStartDateChange,
  onEndDateChange,
}: {
  data: { content: ReportResponse[]; totalPages: number; totalElements: number } | undefined
  isLoading: boolean
  page: number
  dateMode: 'all' | 'single' | 'range'
  singleDate: string
  startDate: string
  endDate: string
  dateFilterActive: boolean
  onPageChange: (p: number) => void
  onDateModeChange: (m: 'all' | 'single' | 'range') => void
  onSingleDateChange: (d: string) => void
  onStartDateChange: (d: string) => void
  onEndDateChange: (d: string) => void
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const reports = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

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
    onDateModeChange('all')
    onSingleDateChange('')
    onStartDateChange('')
    onEndDateChange('')
    onPageChange(0)
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

        <Select value={dateMode} onChange={(e) => { onDateModeChange(e.target.value as 'all' | 'single' | 'range'); onPageChange(0) }} className="w-auto min-w-[150px]">
          <option value="all">All Dates</option>
          <option value="single">Specific Date</option>
          <option value="range">Date Range</option>
        </Select>

        {dateMode === 'single' && (
          <input
            type="date"
            value={singleDate}
            onChange={(e) => { onSingleDateChange(e.target.value); onPageChange(0) }}
            className="rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        )}

        {dateMode === 'range' && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { onStartDateChange(e.target.value); onPageChange(0) }}
              className="rounded-lg border border-outline bg-surface px-4 py-2.5 text-body-md text-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="self-center text-secondary-400 text-sm px-1">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { onEndDateChange(e.target.value); onPageChange(0) }}
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
          description={searchQuery || dateFilterActive ? 'Try adjusting your filters' : 'No diary reports for this yard yet'}
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
                                <>
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
                                  <div className="mt-2 space-y-0.5 text-right">
                                    <p className="text-xs font-semibold text-emerald-700">Subtotal: ${r.reportDetails?.reduce((sum, d) => sum + (d.weight || 0) * (d.unitPrice || 0), 0).toFixed(2) ?? '0.00'}</p>
                                    <p className="text-xs font-semibold text-red-500">Discounts: -${(r.totalDiscount || 0).toFixed(2)}</p>
                                    <p className="text-xs font-semibold text-blue-700">Total Paid: ${(() => { const st = r.reportDetails?.reduce((sum, d) => sum + (d.weight || 0) * (d.unitPrice || 0), 0) ?? 0; return (st - (r.totalDiscount || 0)).toFixed(2); })()}</p>
                                  </div>
                                </>
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
              onClick={() => onPageChange(Math.max(0, page - 1))}
              className="p-2 rounded-lg hover:bg-secondary-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-blue-50 font-medium text-blue-700">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
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
