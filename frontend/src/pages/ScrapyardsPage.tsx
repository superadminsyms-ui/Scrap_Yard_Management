import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { companiesApi } from '@/api/endpoints/companies'
import { Button, Input, Select, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner, Badge } from '@/components/ui'
import type { ScrapYardListItem, ScrapYardFormData } from '@/types/models'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export default function ScrapyardsPage() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const filterCompanyId = searchParams.get('companyId')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingYard, setEditingYard] = useState<ScrapYardListItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', location: '', companyId: 0, active: true })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: yards, isLoading } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.getAll,
  })

  const searchMutation = useMutation({
    mutationFn: scrapyardsApi.searchByName,
  })

  const displayedYards = (() => {
    let result = search ? (searchMutation.data || []) : (yards || [])
    if (filterCompanyId) {
      result = result.filter((y) => {
        const matching = yards?.filter((yy) => yy.companyName && filterCompanyId)
        return matching
      })
    }
    return result as ScrapYardListItem[]
  })()

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) searchMutation.mutate(value)
  }

  const saveMutation = useMutation({
    mutationFn: (data: ScrapYardFormData) =>
      editingYard
        ? scrapyardsApi.update(editingYard.id, { name: data.name, location: data.location })
        : scrapyardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapyards'] })
      setSearch('')
      searchMutation.reset()
      setModalOpen(false)
      setEditingYard(null)
      setForm({ name: '', location: '', companyId: 0, active: true })
      setErrors({})
    },
    onError: (err: Error) => {
      alert(err.message || 'Error saving scrapyard')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => scrapyardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapyards'] })
      setSearch('')
      searchMutation.reset()
      setDeleteId(null)
    },
    onError: (err: Error) => {
      alert(err.message)
      setDeleteId(null)
    },
  })

  const openCreate = () => {
    setEditingYard(null)
    setForm({ name: '', location: '', companyId: 0, active: true })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (yard: ScrapYardListItem) => {
    setEditingYard(yard)
    setForm({ name: yard.name, location: yard.location, companyId: 0, active: true })
    setErrors({})
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!/^[a-zA-Z0-9 ]+$/.test(form.name)) newErrors.name = 'Only letters and numbers allowed'
    if (!form.name.trim() || form.name.length < 3) newErrors.name = 'Name must be at least 3 characters'
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9 ,.\-]+$/.test(form.location)) newErrors.location = 'Must contain letters and numbers'
    if (form.location.length < 5) newErrors.location = 'Minimum 5 characters'
    if (!editingYard && !form.companyId) newErrors.companyId = 'Select a company'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    saveMutation.mutate({
      ...form,
      companyId: editingYard ? 0 : form.companyId,
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Scrapyards" description="Scrapyard management">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Scrapyard</Button>
      </PageHeader>

      <div className="mb-4 flex gap-3 flex-wrap">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {!displayedYards.length ? (
        <EmptyState
          title="No scrapyards registered"
          description="Create the first scrapyard to get started"
          action={{ label: 'New Scrapyard', onClick: openCreate }}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Name</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Location</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Company</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Status</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedYards.map((yard) => (
                <tr key={yard.id} className="hover:bg-surface-100">
                  <td className="px-6 py-4 font-medium text-secondary-800">{yard.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{yard.location}</td>
                  <td className="px-6 py-4 text-secondary-600">{yard.companyName}</td>
                  <td className="px-6 py-4">
                    <Badge variant={yard.active ? 'green' : 'red'}>
                      {yard.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/scrapyards/${yard.id}`}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                        title="View detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(yard)}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(yard.id)}
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
        onClose={() => { setModalOpen(false); setEditingYard(null); setErrors({}) }}
        title={editingYard ? 'Edit Scrapyard' : 'New Scrapyard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            placeholder="Scrapyard name"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            error={errors.location}
            placeholder="Scrapyard address"
          />
          {!editingYard && (
            <Select
              label="Company"
              value={form.companyId || ''}
              onChange={(e) => setForm({ ...form, companyId: Number(e.target.value) })}
              error={errors.companyId}
            >
              <option value="">Select company...</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingYard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Scrapyard"
        message="Are you sure you want to delete this scrapyard? This action cannot be undone."
      />
    </div>
  )
}
