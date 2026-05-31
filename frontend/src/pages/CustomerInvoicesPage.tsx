import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '@/api/endpoints/customers'
import { invoicesApi, type InvoicePageParams } from '@/api/endpoints/invoices'
import { PageHeader, LoadingSpinner, EmptyState, Button } from '@/components/ui'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { InvoiceSummary } from '@/types/models'

export default function CustomerInvoicesPage() {
  const { id } = useParams<{ id: string }>()
  const customerId = Number(id)
  const [page, setPage] = useState(0)

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId),
  })

  const params: InvoicePageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const invoicesQuery = useQuery({
    queryKey: ['customer-invoices', customerId, params],
    queryFn: () => invoicesApi.getByCustomer(customerId, params),
  })

  const invoicePage = invoicesQuery.data
  const invoices: InvoiceSummary[] = invoicePage?.content || []
  const totalPages = invoicePage?.totalPages || 0
  const totalElements = invoicePage?.totalElements || 0

  if (invoicesQuery.isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/customers" className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <PageHeader
            title={`Invoices for ${customerQuery.data?.name || 'Loading...'}`}
            description={`${customerQuery.data?.typeCustomer} - ${customerQuery.data?.personalId}`}
          />
        </div>
      </div>

      {!invoices.length ? (
        <EmptyState title="No invoices for this customer" description="Create an invoice from the invoices module" />
      ) : (
        <>
          <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline bg-surface-50">
                  <th className="text-left px-6 py-3 font-medium text-secondary-600"># Invoice</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-secondary-600">Yard</th>
                  <th className="text-right px-6 py-3 font-medium text-secondary-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-light">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-surface-100">
                    <td className="px-6 py-4">
                      <Link to={`/invoices/${inv.invoiceId}`} className="font-medium text-primary-500 hover:underline">
                        #{inv.invoiceId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-secondary-600">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-secondary-600">{inv.scrapyardName}</td>
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
