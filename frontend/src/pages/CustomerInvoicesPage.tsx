import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '@/api/endpoints/customers'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'

export default function CustomerInvoicesPage() {
  const { id } = useParams<{ id: string }>()
  const customerId = Number(id)

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId),
  })

  const invoicesQuery = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => customersApi.getInvoices(customerId),
  })

  if (invoicesQuery.isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/customers" className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <PageHeader
            title={`Facturas de ${customerQuery.data?.name || 'Cargando...'}`}
            description={`${customerQuery.data?.typeCustomer} - ${customerQuery.data?.personalId}`}
          />
        </div>
      </div>

      {!invoicesQuery.data?.length ? (
        <EmptyState title="No invoices for this customer" description="Create an invoice from the invoices module" />
      ) : (
        <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600"># Factura</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Fecha</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Patio</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {invoicesQuery.data.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-surface-50">
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
      )}
    </div>
  )
}
