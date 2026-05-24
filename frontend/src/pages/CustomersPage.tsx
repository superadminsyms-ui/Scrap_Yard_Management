import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/api/endpoints/customers'
import { companiesApi } from '@/api/endpoints/companies'
import { Button, Input, Select, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner, Badge } from '@/components/ui'
import { CustomerType } from '@/types/models'
import type { Customer, CustomerFormData } from '@/types/models'
import { Plus, Search, Pencil, Trash2, Receipt, RefreshCw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  [CustomerType.REGULAR]: 'Regular',
  [CustomerType.VIP]: 'VIP',
  [CustomerType.WHOLESALE]: 'Wholesale',
}

const CUSTOMER_TYPE_BADGE: Record<CustomerType, 'green' | 'blue' | 'orange'> = {
  [CustomerType.REGULAR]: 'green',
  [CustomerType.VIP]: 'blue',
  [CustomerType.WHOLESALE]: 'orange',
}

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const filterCompanyId = searchParams.get('companyId')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })

  const { data: customersByCompany, isLoading: isLoadingByCompany } = useQuery({
    queryKey: ['customers-by-company', filterCompanyId],
    queryFn: () => customersApi.getByCompany(Number(filterCompanyId)),
    enabled: !!filterCompanyId,
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  })

  const searchMutation = useMutation({
    mutationFn: customersApi.searchByName,
  })

  const filterCompanyName = filterCompanyId
    ? (companies || []).find((c) => c.id === Number(filterCompanyId))?.name
    : null

  const displayedCustomers = (() => {
    if (filterCompanyId) {
      return customersByCompany || []
    }
    const result = search ? (searchMutation.data || []) : (customers || [])
    return result
  })()

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) searchMutation.mutate(value)
  }

  const saveMutation = useMutation({
    mutationFn: (data: CustomerFormData) =>
      editingCustomer
        ? customersApi.update(editingCustomer.id, data)
        : customersApi.create(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['customers'] })
      if (filterCompanyId) queryClient.removeQueries({ queryKey: ['customers-by-company', filterCompanyId] })
      setSearch('')
      searchMutation.reset()
      setModalOpen(false)
      setEditingCustomer(null)
    },
    onError: (err: Error) => alert('Error: ' + err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['customers'] })
      if (filterCompanyId) queryClient.removeQueries({ queryKey: ['customers-by-company', filterCompanyId] })
      setSearch('')
      searchMutation.reset()
      setDeleteId(null)
    },
    onError: (err: Error) => alert('Error deleting: ' + err.message),
  })

  const handleRefresh = async () => {
    if (filterCompanyId) {
      queryClient.removeQueries({ queryKey: ['customers-by-company', filterCompanyId] })
      await queryClient.fetchQuery({
        queryKey: ['customers-by-company', filterCompanyId],
        queryFn: () => customersApi.getByCompany(Number(filterCompanyId)),
      })
    } else {
      queryClient.removeQueries({ queryKey: ['customers'] })
      await queryClient.fetchQuery({ queryKey: ['customers'], queryFn: customersApi.getAll })
    }
  }

  if (filterCompanyId ? isLoadingByCompany : isLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title={filterCompanyName ? `Customers of ${filterCompanyName}` : 'Customers'}
        description={filterCompanyName ? `Showing customers for ${filterCompanyName}` : 'Customer management'}
      >
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleRefresh} title="Refresh data">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={() => { setEditingCustomer(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> New Customer
          </Button>
        </div>
      </PageHeader>

      <div className="mb-4 flex gap-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {!displayedCustomers.length ? (
        <EmptyState
          title="No customers registered"
          description="Create the first customer to get started"
          action={{ label: 'New Customer', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Name</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Personal ID</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Type</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Company</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4 font-medium text-secondary-800">{customer.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{customer.personalId}</td>
                  <td className="px-6 py-4">
                    <Badge variant={CUSTOMER_TYPE_BADGE[customer.typeCustomer]}>
                      {CUSTOMER_TYPE_LABELS[customer.typeCustomer]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-secondary-600">{customer.companyName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/customers/${customer.id}/invoices`}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                        title="View invoices"
                      >
                        <Receipt className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => { setEditingCustomer(customer); setModalOpen(true) }}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(customer.id)}
                        className="p-2 text-secondary-400 hover:text-error-500 rounded-lg hover:bg-error-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCustomer(null) }}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
      >
        <CustomerForm
          initial={editingCustomer}
          companies={companies || []}
          onSubmit={(data) => saveMutation.mutate(data)}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
      />
    </div>
  )
}

function CustomerForm({
  initial,
  companies,
  onSubmit,
  isLoading,
}: {
  initial: Customer | null
  companies: { id: number; name: string }[]
  onSubmit: (data: CustomerFormData) => void
  isLoading: boolean
}) {
  const resolveCompanyId = () => {
    if (!initial) return 0
    const match = companies.find((c) => c.name === initial.companyName)
    return match?.id || 0
  }

  const [form, setForm] = useState({
    name: initial?.name || '',
    personalId: initial?.personalId || '',
    typeCustomer: initial?.typeCustomer || CustomerType.REGULAR,
    companyId: resolveCompanyId(),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.name.trim() || form.name.length < 2) newErrors.name = 'Name required (minimum 2 characters)'
    if (!form.personalId.trim()) newErrors.personalId = 'Personal ID required'
    if (!form.companyId) newErrors.companyId = 'Select a company'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        placeholder="Customer name"
      />
      <Input
        label="Personal ID"
        value={form.personalId}
        onChange={(e) => setForm({ ...form, personalId: e.target.value })}
        error={errors.personalId}
        placeholder="DNI, RUC, etc."
      />
      <Select
        label="Customer Type"
        value={form.typeCustomer}
        onChange={(e) => setForm({ ...form, typeCustomer: e.target.value as CustomerType })}
      >
        <option value={CustomerType.REGULAR}>Regular</option>
        <option value={CustomerType.VIP}>VIP</option>
        <option value={CustomerType.WHOLESALE}>Wholesale</option>
      </Select>
      {!initial && (
        <Select
          label="Company"
          value={form.companyId || ''}
          onChange={(e) => setForm({ ...form, companyId: Number(e.target.value) })}
          error={errors.companyId}
        >
          <option value="">Select company...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}
      {initial && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Company</label>
          <p className="text-sm text-secondary-800 bg-surface-50 rounded-lg px-3 py-2">
            {initial.companyName || 'Not assigned'}
          </p>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
