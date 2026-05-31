import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { invoicesApi, type InvoicePageParams } from '@/api/endpoints/invoices'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { Button, Select, Badge, PageHeader, EmptyState, LoadingSpinner } from '@/components/ui'
import type { InvoiceSummary } from '@/types/models'
import { Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function InvoicesPage() {
  const navigate = useNavigate()
  const { isSuperAdmin } = useAuth()
  const [yardFilter, setYardFilter] = useState('')
  const [page, setPage] = useState(0)

  const params: InvoicePageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const { data: invoicesPage, isLoading } = useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getAll(params),
  })

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const yardParams: InvoicePageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const yardInvoicesQuery = useQuery({
    queryKey: ['invoices-by-yard', yardFilter, yardParams],
    queryFn: () => invoicesApi.getByYard(Number(yardFilter), yardParams),
    enabled: !!yardFilter,
  })

  const activeData = yardFilter ? yardInvoicesQuery.data : invoicesPage
  const displayedInvoices: InvoiceSummary[] = activeData?.content || []
  const totalPages = activeData?.totalPages || 0
  const totalElements = activeData?.totalElements || 0
  const isDataLoading = yardFilter ? yardInvoicesQuery.isLoading : isLoading

  if (isDataLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Invoices" description="Invoice management">
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </PageHeader>

      {isSuperAdmin && (
        <div className="mb-4">
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
        </div>
      )}

      {!displayedInvoices.length ? (
        <EmptyState
          title="No invoices"
          description="Create the first invoice to get started"
          action={{ label: 'New Invoice', onClick: () => navigate('/invoices/new') }}
        />
      ) : (
        <>
          <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-50">
                  <th className="text-left px-6 py-3 font-medium text-secondary-600"># Invoice</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Scrapyard</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
                  <th className="text-right px-6 py-3 font-medium text-secondary-600">Total</th>
                  <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-light">
                {displayedInvoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-surface-100">
                    <td className="px-6 py-4 font-medium text-secondary-800">#{inv.invoiceId}</td>
                    <td className="px-6 py-4 text-secondary-600">{inv.customerName}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          inv.customerType === 'REGULAR' ? 'green' :
                          inv.customerType === 'VIP' ? 'blue' : 'orange'
                        }
                      >
                        {inv.customerType === 'REGULAR' ? 'Regular' :
                         inv.customerType === 'VIP' ? 'VIP' : 'Wholesale'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{inv.scrapyardName}</td>
                    <td className="px-6 py-4 text-secondary-600">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-secondary-800">
                      ${inv.totalPaid?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/invoices/${inv.invoiceId}`}
                          className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-secondary-600">
              <span>
                Showing {displayedInvoices.length} of {totalElements} invoices
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
