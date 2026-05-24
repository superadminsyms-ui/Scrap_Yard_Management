import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { managersApi, type ManagerWithId, type ManagerInsertData } from '@/api/endpoints/managers'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { authApi } from '@/api/endpoints/auth'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types/models'
import { Button, Input, Select, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner } from '@/components/ui'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

export default function ManagersPage() {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingManager, setEditingManager] = useState<ManagerWithId | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: managers, isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: managersApi.getAll,
  })

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const searchMutation = useMutation({
    mutationFn: managersApi.searchByName,
  })

  const displayedManagers = search ? (searchMutation.data || []) : (managers || [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) searchMutation.mutate(value)
  }

  const saveMutation = useMutation({
    mutationFn: (data: ManagerInsertData & { password?: string }) =>
      editingManager
        ? managersApi.update(editingManager.id, data)
        : authApi.register({
            email: data.email,
            password: data.password || '',
            name: data.name,
            phone: data.phone,
            scrapYardId: data.scrapYardId,
            role: UserRole.MANAGER,
          }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['managers'] })
      setModalOpen(false)
      setEditingManager(null)
      if (!editingManager) {
        const email = 'email' in result ? (result as any).email : ''
        setSuccessMessage(
          `Manager created successfully. They can log in with email ${email} and the password provided.`
        )
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    },
    onError: (err: any) => {
      // error handled in form
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => managersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] })
      setDeleteId(null)
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Managers" description="Scrapyard manager management">
        {isSuperAdmin && (
          <Button onClick={() => { setEditingManager(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> New Manager
          </Button>
        )}
      </PageHeader>

      {successMessage && (
        <div className="mb-4 bg-success-50 text-success-700 text-sm p-3 rounded-xl border border-success-200">
          {successMessage}
        </div>
      )}

      <div className="mb-4">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-md"
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {!displayedManagers.length ? (
        <EmptyState
          title="No managers registered"
          description="Create the first manager to get started"
          action={isSuperAdmin ? { label: 'New Manager', onClick: () => setModalOpen(true) } : undefined}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline bg-surface-50">
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Name</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Phone</th>
                <th className="text-left px-6 py-3 font-medium text-secondary-600">Yard</th>
                <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedManagers.map((m) => (
                <tr key={m.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4 font-medium text-secondary-800">{m.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.email}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.phone || '-'}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.scrapYardName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingManager(m); setModalOpen(true) }}
                        className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(m.id)}
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
        onClose={() => { setModalOpen(false); setEditingManager(null) }}
        title={editingManager ? 'Edit Manager' : 'New Manager'}
      >
        <ManagerForm
          initial={editingManager}
          yards={yards || []}
          onSubmit={(data) => saveMutation.mutate(data)}
          isLoading={saveMutation.isPending}
          serverError={saveMutation.error ? (saveMutation.error as Error).message : ''}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Manager"
        message="Are you sure you want to delete this manager?"
      />
    </div>
  )
}

function ManagerForm({
  initial,
  yards,
  onSubmit,
  isLoading,
  serverError,
}: {
  initial: ManagerWithId | null
  yards: { id: number; name: string }[]
  onSubmit: (data: ManagerInsertData & { password?: string }) => void
  isLoading: boolean
  serverError: string
}) {
  const isEditing = !!initial
  const [form, setForm] = useState<ManagerInsertData & { password: string; confirmPassword: string }>({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    scrapYardId: 0,
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name required'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.name)) newErrors.name = 'Only letters allowed'
    if (!form.email.trim()) newErrors.email = 'Email required'
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.phone.trim()) newErrors.phone = 'Phone required'
    if (!isEditing && !form.scrapYardId) newErrors.scrapYardId = 'Select a yard'
    if (!isEditing) {
      if (!form.password) newErrors.password = 'Password required'
      else if (form.password.length < 6) newErrors.password = 'At least 6 characters'
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
          {serverError}
        </div>
      )}

      <Input
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        placeholder="Manager name"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="email@example.com"
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        error={errors.phone}
        placeholder="Phone number"
      />
      {!isEditing && (
        <>
          <Select
            label="Yard"
            value={form.scrapYardId || ''}
            onChange={(e) => setForm({ ...form, scrapYardId: Number(e.target.value) })}
            error={errors.scrapYardId}
          >
            <option value="">Select yard...</option>
            {yards.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </Select>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            placeholder="At least 6 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            placeholder="Re-enter the password"
          />
        </>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
