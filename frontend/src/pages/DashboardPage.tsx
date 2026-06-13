import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/endpoints/dashboard'
import { useAuth } from '@/context/AuthContext'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import { StatCard, Badge, LoadingSpinner, Card } from '@/components/ui'
import { MovementType } from '@/types/models'
import { Building2, Warehouse, Box, Users, Receipt, ArrowRightLeft, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { isSuperAdmin } = useAuth()
  const theme = useRoleTheme()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
  })

  if (isLoading) return <LoadingSpinner />

  const totalSpent = stats?.totalSpent ?? 0
  const recentInvoices = stats?.recentInvoices ?? []
  const recentMovements = stats?.recentMovements ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-800">
          {isSuperAdmin ? 'Dashboard' : stats?.scrapyardName ?? 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-secondary-500">
          {isSuperAdmin
            ? 'General overview of the scrapyard management system'
            : stats?.scrapyardLocation
              ? `Scrapyard: ${stats.scrapyardLocation}`
              : 'Scrapyard overview'}
        </p>
      </div>

      {isSuperAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Companies" value={stats?.totalCompanies ?? 0} icon={<Building2 className="w-5 h-5" />} />
          <StatCard title="Scrapyards" value={stats?.totalScrapyards ?? 0} icon={<Warehouse className="w-5 h-5" />} />
          <StatCard title="Containers" value={stats?.totalContainers ?? 0} icon={<Box className="w-5 h-5" />} />
          <StatCard title="Customers" value={stats?.totalCustomers ?? 0} icon={<Users className="w-5 h-5" />} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Containers" value={stats?.totalContainers ?? 0} icon={<Box className="w-5 h-5" />} />
          <StatCard title="Customers" value={stats?.totalCustomers ?? 0} icon={<Users className="w-5 h-5" />} />
          <StatCard title="Invoices" value={stats?.totalInvoices ?? 0} icon={<Receipt className="w-5 h-5" />} />
          <StatCard title="Movements" value={stats?.totalMovements ?? 0} icon={<ArrowRightLeft className="w-5 h-5" />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Spent on Purchases"
          value={`$${totalSpent.toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices ?? 0}
          icon={<Receipt className="w-5 h-5" />}
        />
        <StatCard
          title="Total Movements"
          value={stats?.totalMovements ?? 0}
          icon={<ArrowRightLeft className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary-800">Recent Invoices</h2>
            <Link to="/app/invoices" className="text-xs text-primary-500 hover:underline">View all</Link>
          </div>
          {!recentInvoices.length ? (
            <p className="text-sm text-secondary-400 py-4 text-center">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.invoiceId}
                  to={`/app/invoices/${inv.invoiceId}`}
                  className="flex items-center justify-between py-2 border-b border-outline-light last:border-0 hover:bg-surface-100 rounded px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-secondary-800">#{inv.invoiceId}</span>
                    <span className="text-sm text-secondary-600">{inv.customerName}</span>
                  </div>
                  <span className="text-sm font-medium text-secondary-800">${inv.totalPaid?.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-secondary-800">Recent Movements</h2>
            <Link to="/app/movements" className="text-xs text-primary-500 hover:underline">View all</Link>
          </div>
          {!recentMovements.length ? (
            <p className="text-sm text-secondary-400 py-4 text-center">No movements yet</p>
          ) : (
            <div className="space-y-3">
              {recentMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 border-b border-outline-light last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        m.movementType === MovementType.INBOUND ? 'green' :
                        m.movementType === MovementType.OUTBOUND ? 'red' : 'blue'
                      }
                    >
                      {m.movementType === MovementType.INBOUND ? 'Inbound' :
                       m.movementType === MovementType.OUTBOUND ? 'Outbound' : 'Transfer'}
                    </Badge>
                    <span className="text-sm text-secondary-600">
                      {m.containerDescription} &rarr; {m.destination}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-secondary-800">
                      {m.amountMoved} {m.unitOfMeasure}
                    </span>
                    <p className="text-xs text-secondary-400">
                      {new Date(m.movementDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/app/invoices/new"
          className={cn(
            'flex items-center justify-center gap-2 py-3 px-4 rounded-full text-label-lg font-medium transition-colors shadow-elevation-1 hover:shadow-elevation-2',
            theme.btnPrimary,
          )}
        >
          <Receipt className="w-4 h-4" /> New Invoice
        </Link>
        <Link
          to="/app/movements"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-success-600 text-white rounded-full text-label-lg font-medium hover:bg-success-700 transition-colors shadow-elevation-1 hover:shadow-elevation-2"
        >
          <ArrowRightLeft className="w-4 h-4" /> New Movement
        </Link>
        {isSuperAdmin ? (
          <>
            <Link
              to="/app/scrapyards"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary-700 text-white rounded-full text-label-lg font-medium hover:bg-secondary-800 transition-colors shadow-elevation-1 hover:shadow-elevation-2"
            >
              <Warehouse className="w-4 h-4" /> View Inventory
            </Link>
            <Link
              to="/app/companies"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary-700 text-white rounded-full text-label-lg font-medium hover:bg-secondary-800 transition-colors shadow-elevation-1 hover:shadow-elevation-2"
            >
              <Building2 className="w-4 h-4" /> Manage Companies
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/app/containers"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary-700 text-white rounded-full text-label-lg font-medium hover:bg-secondary-800 transition-colors shadow-elevation-1 hover:shadow-elevation-2"
            >
              <Box className="w-4 h-4" /> View Containers
            </Link>
            <Link
              to="/app/customers"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary-700 text-white rounded-full text-label-lg font-medium hover:bg-secondary-800 transition-colors shadow-elevation-1 hover:shadow-elevation-2"
            >
              <Users className="w-4 h-4" /> Manage Customers
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
