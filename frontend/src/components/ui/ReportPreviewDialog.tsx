import { MaterialType } from '@/types/models'
import { X, AlertTriangle, FileText, DollarSign, Package, Wallet } from 'lucide-react'

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

export interface PreviewDetail {
  materialType: MaterialType
  weight: number
  unitPrice: number
  containerId: number
}

export interface PreviewSpend {
  amount: number
  description: string
}

interface ReportPreviewDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  yardName: string
  managerName: string
  startingBalance: number
  addedMoney: number
  totalInvested: number
  balance: number
  notes: string
  details: PreviewDetail[]
  spends: PreviewSpend[]
  containerMap: Record<number, string>
}

export function ReportPreviewDialog({
  open,
  onClose,
  onConfirm,
  yardName,
  managerName,
  startingBalance,
  addedMoney,
  totalInvested,
  balance,
  notes,
  details,
  spends,
  containerMap,
}: ReportPreviewDialogProps) {
  if (!open) return null

  const detailsTotal = details.reduce((sum, d) => sum + (d.weight || 0) * (d.unitPrice || 0), 0)
  const spendsTotal = spends.reduce((sum, s) => sum + (s.amount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface rounded-3xl shadow-elevation-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-outline-light shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-title-lg text-secondary-800">Report Preview</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-2">Report Info</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-secondary-400">Yard</span>
                <p className="text-secondary-800 font-medium">{yardName}</p>
              </div>
              <div>
                <span className="text-secondary-400">Manager</span>
                <p className="text-secondary-800 font-medium">{managerName}</p>
              </div>
              <div>
                <span className="text-secondary-400">Starting Balance</span>
                <p className="text-secondary-800 font-medium">${startingBalance.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-secondary-400">Added Money</span>
                <p className="text-secondary-800 font-medium">${addedMoney.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-secondary-400">Total Invested</span>
                <p className="text-secondary-800 font-semibold">${totalInvested.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-secondary-400">Balance</span>
                <p className="text-secondary-800 font-semibold">${balance.toFixed(2)}</p>
              </div>
            </div>
            {notes && (
              <div className="mt-2">
                <span className="text-secondary-400 text-sm">Notes</span>
                <p className="text-sm text-secondary-600 mt-0.5">{notes}</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Material Details ({details.length})
              </h3>
            </div>
            {details.length === 0 ? (
              <p className="text-sm text-secondary-400">No material details</p>
            ) : (
              <div className="border border-outline rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-outline">
                      <th className="text-left py-2 px-3 font-medium text-secondary-500">Material</th>
                      <th className="text-left py-2 px-3 font-medium text-secondary-500">Container</th>
                      <th className="text-right py-2 px-3 font-medium text-secondary-500">Weight</th>
                      <th className="text-right py-2 px-3 font-medium text-secondary-500">Price</th>
                      <th className="text-right py-2 px-3 font-medium text-secondary-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-light">
                    {details.map((d, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 text-secondary-800">{MATERIAL_LABELS[d.materialType] || d.materialType}</td>
                        <td className="py-2 px-3 text-secondary-600">{containerMap[d.containerId] || `#${d.containerId}`}</td>
                        <td className="py-2 px-3 text-right text-secondary-800">{d.weight}</td>
                        <td className="py-2 px-3 text-right text-secondary-800">${d.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-600">${(d.weight * d.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {details.length > 0 && (
              <p className="text-right text-xs font-semibold text-emerald-700 mt-1">Subtotal: ${detailsTotal.toFixed(2)}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Spends ({spends.length})
              </h3>
            </div>
            {spends.length === 0 ? (
              <p className="text-sm text-secondary-400">No spends registered</p>
            ) : (
              <div className="border border-outline rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-outline">
                      <th className="text-left py-2 px-3 font-medium text-secondary-500">Description</th>
                      <th className="text-right py-2 px-3 font-medium text-secondary-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-light">
                    {spends.map((s, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 text-secondary-800">{s.description}</td>
                        <td className="py-2 px-3 text-right font-semibold text-amber-600">${s.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {spends.length > 0 && (
              <p className="text-right text-xs font-semibold text-amber-700 mt-1">Total: ${spendsTotal.toFixed(2)}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-outline-light bg-amber-50 shrink-0">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              You are about to create a new report. Please review all data carefully as this is an irreversible operation.
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-label-lg text-secondary-700 bg-secondary-100 rounded-full hover:bg-secondary-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 text-label-lg text-white bg-primary-500 rounded-full hover:bg-primary-600 shadow-elevation-1 transition-colors"
            >
              Confirm & Create
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
