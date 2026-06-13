import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi } from '@/api/endpoints/companies'
import { Button, Input, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner } from '@/components/ui'
import type { Company, CompanyFormData } from '@/types/models'
import { Plus, Search, Pencil, Trash2, Warehouse, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CompaniesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  })

  const searchMutation = useMutation({
    mutationFn: companiesApi.searchByName,
    onSuccess: () => {},
  })

  const displayedCompanies = search
    ? searchMutation.data || []
    : companies || []

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) {
      searchMutation.mutate(value)
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data: CompanyFormData) =>
      editingCompany
        ? companiesApi.update(editingCompany.id, data)
        : companiesApi.create(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['companies'] })
      setSearch('')
      searchMutation.reset()
      setModalOpen(false)
      setEditingCompany(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['companies'] })
      setSearch('')
      searchMutation.reset()
      setDeleteId(null)
    },
    onError: (err: Error) => alert(err.message),
  })

  return (
    <div>
      <PageHeader title="Companies" description="Management of companies registered in the system">
        <Button onClick={() => { setEditingCompany(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> New Company
        </Button>
      </PageHeader>

      <div className="mb-4">
        <Input
          placeholder="Search company by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {!displayedCompanies.length ? (
        <EmptyState
          title="No companies registered"
          description="Create the first company to get started"
          action={{ label: 'New Company', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Name</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Location</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-surface-100">
                  <td className="px-6 py-4 font-medium text-secondary-800">{company.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{company.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/app/scrapyards?companyId=${company.id}`}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                        title="View scrapyards"
                      >
                        <Warehouse className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/app/customers?companyId=${company.id}`}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                        title="View customers"
                      >
                        <Users className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => { setEditingCompany(company); setModalOpen(true) }}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(company.id)}
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
        onClose={() => { setModalOpen(false); setEditingCompany(null) }}
        title={editingCompany ? 'Edit Company' : 'New Company'}
      >
        <CompanyForm
          initial={editingCompany}
          onSubmit={(data) => saveMutation.mutate(data)}
          isLoading={saveMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone."
      />
    </div>
  )
}

function CompanyForm({
  initial,
  onSubmit,
  isLoading,
}: {
  initial: Company | null
  onSubmit: (data: CompanyFormData) => void
  isLoading: boolean
}) {
  const [name, setName] = useState(initial?.name || '')
  const [location, setLocation] = useState(initial?.location || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!/^[a-zA-Z ]+$/.test(name)) newErrors.name = 'Only letters allowed'
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!/^[a-zA-Z ]+$/.test(location)) newErrors.location = 'Only letters allowed'
    if (!location.trim()) newErrors.location = 'Location is required'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSubmit({ name: name.trim(), location: location.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Company name"
      />
      <Input
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        error={errors.location}
        placeholder="Company location"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initial ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
