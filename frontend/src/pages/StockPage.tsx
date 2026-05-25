import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { PageHeader, Tabs, LoadingSpinner, EmptyState, Badge, StatCard, Card, Button, Select } from '@/components/ui'
import { MaterialType, MovementType, ReportPeriod } from '@/types/models'
import type { Container, InvoiceSummary, Movement, MaterialStockItem, ContainerStockItem, YardStockSummary, ScrapyardReport } from '@/types/models'
import { Scale, Package, TrendingUp, Receipt, FileDown } from 'lucide-react'

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

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.INBOUND]: 'Inbound',
  [MovementType.OUTBOUND]: 'Outbound',
  [MovementType.TRANSFER]: 'Transfer',
}

export default function StockPage() {
  const { user } = useAuth()
  const yardId = user?.yardId
  const [activeTab, setActiveTab] = useState('stock')

  const yardQuery = useQuery({
    queryKey: ['scrapyard', yardId],
    queryFn: () => scrapyardsApi.getById(yardId!),
    enabled: !!yardId,
  })

  const stockTotalQuery = useQuery({
    queryKey: ['scrapyard-stock', yardId],
    queryFn: () => scrapyardsApi.getStock(yardId!),
    enabled: activeTab === 'stock' && !!yardId,
  })

  const stockContainersQuery = useQuery({
    queryKey: ['scrapyard-stock-containers', yardId],
    queryFn: () => scrapyardsApi.getStockByContainers(yardId!),
    enabled: activeTab === 'stock' && !!yardId,
  })

  const invoicesQuery = useQuery({
    queryKey: ['scrapyard-invoices', yardId],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/invoices')
      return mod.invoicesApi.getByYard(yardId!)
    },
    enabled: activeTab === 'invoices' && !!yardId,
  })

  const movementsQuery = useQuery({
    queryKey: ['scrapyard-movements', yardId],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/movements')
      return mod.movementsApi.getByYard(yardId!)
    },
    enabled: activeTab === 'movements' && !!yardId,
  })

  const resumeQuery = useQuery({
    queryKey: ['scrapyard-resume', yardId],
    queryFn: async () => {
      const mod = await import('@/api/endpoints/invoices')
      return mod.invoicesApi.getByYard(yardId!)
    },
    enabled: activeTab === 'resume' && !!yardId,
  })

  const [reportType, setReportType] = useState('PURCHASES')
  const [reportPeriod, setReportPeriod] = useState('MONTHLY')

  const reportQuery = useQuery({
    queryKey: ['scrapyard-report', yardId, reportType, reportPeriod],
    queryFn: () => scrapyardsApi.getReport(yardId!, reportType, reportPeriod),
    enabled: activeTab === 'reports' && !!yardId,
  })

  const tabs = [
    { key: 'stock', label: 'Stock' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'movements', label: 'Movements' },
    { key: 'resume', label: 'Resume' },
    { key: 'reports', label: 'Reports' },
  ]

  if (!yardId) {
    return (
      <div>
        <PageHeader title="Stock" description="Inventory management" />
        <EmptyState title="No yard assigned" description="Your account is not linked to a scrapyard" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={yardQuery.data?.name || 'Stock'}
        description={yardQuery.data?.companyName ? `${yardQuery.data.companyName} · ${yardQuery.data.location}` : 'Inventory management'}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
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
      </Tabs>
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
        <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
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
                <tr key={i} className="hover:bg-surface-50">
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

function InvoicesTab({ data, isLoading }: { data: InvoiceSummary[] | undefined; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title="No invoices in this scrapyard" />
  return (
    <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
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
          {data.map((inv) => (
            <tr key={inv.invoiceId} className="hover:bg-surface-50">
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
  )
}

function MovementsTab({ data, isLoading }: { data: Movement[] | undefined; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title="No movements registered" />
  return (
    <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
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
          {data.map((m) => (
            <tr key={m.id} className="hover:bg-surface-50">
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
              <div className="bg-white rounded-2xl border border-outline overflow-hidden">
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
                      <tr key={inv.invoiceId} className="hover:bg-surface-50">
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
              <div className="bg-white rounded-2xl border border-outline overflow-hidden">
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
                      <tr key={i} className="hover:bg-surface-50">
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
