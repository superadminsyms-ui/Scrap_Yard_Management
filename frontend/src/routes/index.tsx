import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProtectedRoute, SuperAdminRoute, RedirectIfAuth } from '@/components/ProtectedRoute'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ChangePasswordPage = lazy(() => import('@/pages/ChangePasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const ScrapyardsPage = lazy(() => import('@/pages/ScrapyardsPage'))
const ScrapyardDetailPage = lazy(() => import('@/pages/ScrapyardDetailPage'))
const ContainersPage = lazy(() => import('@/pages/ContainersPage'))
const CustomersPage = lazy(() => import('@/pages/CustomersPage'))
const CustomerInvoicesPage = lazy(() => import('@/pages/CustomerInvoicesPage'))
const ManagersPage = lazy(() => import('@/pages/ManagersPage'))
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'))
const CreateInvoicePage = lazy(() => import('@/pages/CreateInvoicePage'))
const InvoiceDetailPage = lazy(() => import('@/pages/InvoiceDetailPage'))
const MovementsPage = lazy(() => import('@/pages/MovementsPage'))
const StockPage = lazy(() => import('@/pages/StockPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const BackupPage = lazy(() => import('@/pages/BackupPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <RedirectIfAuth><SuspenseWrapper><LoginPage /></SuspenseWrapper></RedirectIfAuth>,
  },
  {
    path: '/change-password',
    element: <ProtectedRoute><SuspenseWrapper><ChangePasswordPage /></SuspenseWrapper></ProtectedRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
      {
        path: 'companies',
        element: <SuperAdminRoute><SuspenseWrapper><CompaniesPage /></SuspenseWrapper></SuperAdminRoute>,
      },
      {
        path: 'scrapyards',
        element: <SuperAdminRoute><SuspenseWrapper><ScrapyardsPage /></SuspenseWrapper></SuperAdminRoute>,
      },
      { path: 'scrapyards/:id', element: <SuspenseWrapper><ScrapyardDetailPage /></SuspenseWrapper> },
      { path: 'containers', element: <SuspenseWrapper><ContainersPage /></SuspenseWrapper> },
      { path: 'customers', element: <SuspenseWrapper><CustomersPage /></SuspenseWrapper> },
      { path: 'customers/:id/invoices', element: <SuspenseWrapper><CustomerInvoicesPage /></SuspenseWrapper> },
      { path: 'managers', element: <SuspenseWrapper><ManagersPage /></SuspenseWrapper> },
      { path: 'invoices', element: <SuspenseWrapper><InvoicesPage /></SuspenseWrapper> },
      { path: 'invoices/new', element: <SuspenseWrapper><CreateInvoicePage /></SuspenseWrapper> },
      { path: 'invoices/:id', element: <SuspenseWrapper><InvoiceDetailPage /></SuspenseWrapper> },
      { path: 'movements', element: <SuspenseWrapper><MovementsPage /></SuspenseWrapper> },
      {
        path: 'backup',
        element: <SuperAdminRoute><SuspenseWrapper><BackupPage /></SuspenseWrapper></SuperAdminRoute>,
      },
      { path: 'stock', element: <SuspenseWrapper><StockPage /></SuspenseWrapper> },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
    ],
  },
])
