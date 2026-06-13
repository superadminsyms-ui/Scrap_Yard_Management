import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/api/endpoints/invoices'
import { Card, Badge, Button, LoadingSpinner, EmptyState } from '@/components/ui'
import { MaterialType, UnitOfMeasure } from '@/types/models'
import { generateInvoicePDF } from '@/utils/pdf'
import { ArrowLeft, Download } from 'lucide-react'

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

const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.KILOGRAMS]: 'kg',
  [UnitOfMeasure.POUNDS]: 'lbs',
  [UnitOfMeasure.TONNES]: 'ton',
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const invoiceId = Number(id)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => invoicesApi.getById(invoiceId),
  })

  if (isLoading) return <LoadingSpinner />
  if (!invoice) return <EmptyState title="Invoice not found" />

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/app/invoices" className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-secondary-800">Invoice #{invoice.invoiceId}</h1>
            <Badge variant={invoice.details?.length ? 'green' : 'gray'}>
              {invoice.details?.length ? 'Active' : 'No details'}
            </Badge>
          </div>
          <p className="text-sm text-secondary-500">
            Created on {new Date(invoice.createdAt).toLocaleDateString()} &middot;{' '}
            {new Date(invoice.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={() => generateInvoicePDF(invoice)} variant="secondary">
          <Download className="w-4 h-4" /> PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">General Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary-500">Customer</p>
                <p className="text-sm font-medium text-secondary-800">{invoice.customerName}</p>
                <Badge variant={invoice.customerType === 'REGULAR' ? 'green' : invoice.customerType === 'VIP' ? 'blue' : 'orange'} className="mt-1">
                  {invoice.customerType === 'REGULAR' ? 'Regular' : invoice.customerType === 'VIP' ? 'VIP' : 'Wholesale'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Scrapyard</p>
                <p className="text-sm font-medium text-secondary-800">{invoice.scrapyardName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Manager</p>
                <p className="text-sm font-medium text-secondary-800">{invoice.managerName}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Customer ID</p>
                <p className="text-sm font-medium text-secondary-800">{invoice.customerId}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">
              Details ({invoice.details?.length || 0} line{invoice.details?.length !== 1 ? 's' : ''})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline bg-surface-50">
                    <th className="text-left px-4 py-3 font-medium text-secondary-600">Material</th>
                    <th className="text-right px-4 py-3 font-medium text-secondary-600">Weight</th>
                    <th className="text-right px-4 py-3 font-medium text-secondary-600">Price/u</th>
                    <th className="text-center px-4 py-3 font-medium text-secondary-600">Container</th>
                    <th className="text-right px-4 py-3 font-medium text-secondary-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-light">
                  {invoice.details?.map((d) => (
                    <tr key={d.detailId} className="hover:bg-surface-50">
                      <td className="px-4 py-3">
                        <Badge variant="blue">{MATERIAL_LABELS[d.materialType] || d.materialType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-secondary-800">
                        {d.weight} {UNIT_LABELS[d.unit]}
                      </td>
                      <td className="px-4 py-3 text-right text-secondary-800">
                        ${d.unitPrice?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center text-secondary-600">
                        #{d.containerId}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-secondary-800">
                        ${d.subtotal?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-secondary-800 mb-4">Totals</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Lines</span>
                <span className="font-medium">{invoice.details?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Subtotal</span>
                <span className="font-medium">
                  ${invoice.details?.reduce((sum, d) => sum + d.subtotal, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Discount</span>
                <span className="font-medium">${(invoice.discount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-outline pt-3 flex justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span className="text-success-800">${invoice.totalPaid?.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
