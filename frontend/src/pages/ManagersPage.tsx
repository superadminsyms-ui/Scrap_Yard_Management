import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { managersApi, type ManagerWithId, type ManagerInsertData } from '@/api/endpoints/managers'
import { scrapyardsApi } from '@/api/endpoints/scrapyards'
import { authApi } from '@/api/endpoints/auth'
import { adminApi } from '@/api/endpoints/admin'
import { useAuth } from '@/context/AuthContext'
import { UserRole, type UserListResponse, type UserUpdateRequest } from '@/types/models'
import { Button, Input, Select, Modal, ConfirmDialog, PageHeader, EmptyState, LoadingSpinner, Badge, Tabs } from '@/components/ui'
import { Plus, Search, Pencil, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'

export default function ManagersPage() {
  const queryClient = useQueryClient()
  const { isSuperAdmin, user: currentUser } = useAuth()

  const [activeTab, setActiveTab] = useState('managers')

  // --- Managers tab state ---
  const [search, setSearch] = useState('')
  const [selectedManager, setSelectedManager] = useState<ManagerWithId | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // --- User Accounts tab state ---
  const [userSearch, setUserSearch] = useState('')
  const [credentialModalOpen, setCredentialModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListResponse | null>(null)
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false)
  const [newManagerModalOpen, setNewManagerModalOpen] = useState(false)
  const [deactivateUserId, setDeactivateUserId] = useState<number | null>(null)
  const [userSuccessMessage, setUserSuccessMessage] = useState('')

  const { data: managers, isLoading: managersLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: managersApi.getAll,
  })

  const { data: yards } = useQuery({
    queryKey: ['scrapyards'],
    queryFn: scrapyardsApi.getAll,
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.listUsers,
    enabled: isSuperAdmin,
  })

  const searchMutation = useMutation({
    mutationFn: managersApi.searchByName,
  })

  const displayedManagers = search ? (searchMutation.data || []) : (managers || [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) searchMutation.mutate(value)
  }

  // --- User Account mutations ---
  const editUserMutation = useMutation({
    mutationFn: async ({
      userId,
      userData,
      profileData,
      managerId,
    }: {
      userId: number
      userData: UserUpdateRequest
      profileData?: ManagerInsertData
      managerId?: number | null
    }) => {
      if (profileData && managerId) {
        await managersApi.update(managerId, profileData)
      }
      if (Object.keys(userData).length > 0) {
        await adminApi.updateUser(userId, userData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['managers'] })
      setCredentialModalOpen(false)
      setEditingUser(null)
      setUserSuccessMessage('User updated successfully')
      setTimeout(() => setUserSuccessMessage(''), 3000)
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setUserSuccessMessage('User activated successfully')
      setTimeout(() => setUserSuccessMessage(''), 3000)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => adminApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setDeactivateUserId(null)
      setUserSuccessMessage('User deactivated successfully')
      setTimeout(() => setUserSuccessMessage(''), 3000)
    },
  })

  const createSuperAdminMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.register({
        email: data.email,
        password: data.password,
        name: data.email,
        role: UserRole.SUPERADMIN,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSuperAdminModalOpen(false)
      const email = 'email' in result ? (result as any).email : ''
      setUserSuccessMessage(
        `Super Admin created successfully. They can log in with email ${email} and the password provided.`
      )
      setTimeout(() => setUserSuccessMessage(''), 5000)
    },
  })

  const createManagerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string; phone: string; scrapYardId: number }) =>
      authApi.register({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        scrapYardId: data.scrapYardId,
        role: UserRole.MANAGER,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['managers'] })
      setNewManagerModalOpen(false)
      const email = 'email' in result ? (result as any).email : ''
      setUserSuccessMessage(
        `Manager created successfully. They can log in with email ${email} and the password provided.`
      )
      setTimeout(() => setUserSuccessMessage(''), 5000)
    },
  })

  const filteredUsers = userSearch
    ? (users || []).filter((u) =>
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : (users || [])

  const tabs = isSuperAdmin
    ? [
        { key: 'managers', label: 'Managers' },
        { key: 'users', label: 'User Accounts' },
      ]
    : []

  const isLoading = managersLoading || (isSuperAdmin && usersLoading)

  if (isLoading) return <LoadingSpinner />

  const pageContent = isSuperAdmin ? (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'managers' ? (
        // ---- MANAGERS TAB (SUPERADMIN - read only) ----
        <div>
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
              description="Switch to the User Accounts tab to create one"
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
                    <th className="text-center px-6 py-3 font-medium text-secondary-600">Details</th>
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
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => { setSelectedManager(m); setDetailsModalOpen(true) }}
                            className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // ---- USER ACCOUNTS TAB (SUPERADMIN) ----
        <div>
          {userSuccessMessage && (
            <div className="mb-4 bg-success-50 text-success-700 text-sm p-3 rounded-xl border border-success-200">
              {userSuccessMessage}
            </div>
          )}
          <div className="mb-4">
            <Input
              placeholder="Search by email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-md"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          {!filteredUsers.length ? (
            <EmptyState
              title="No user accounts registered"
              description="Create the first user to get started"
              action={{ label: 'New Super Admin', onClick: () => setSuperAdminModalOpen(true) }}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline bg-surface-50">
                    <th className="text-left px-6 py-3 font-medium text-secondary-600">Email</th>
                    <th className="text-left px-6 py-3 font-medium text-secondary-600">Role</th>
                    <th className="text-left px-6 py-3 font-medium text-secondary-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-secondary-600">Must Change PW</th>
                    <th className="text-left px-6 py-3 font-medium text-secondary-600">Manager / Yard</th>
                    <th className="text-right px-6 py-3 font-medium text-secondary-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-light">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id
                    return (
                      <tr key={u.id} className="hover:bg-surface-50">
                        <td className="px-6 py-4 font-medium text-secondary-800">{u.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={u.role === 'SUPERADMIN' ? 'blue' : 'gray'}>
                            {u.role === 'SUPERADMIN' ? 'Super Admin' : 'Manager'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={u.active ? 'green' : 'red'}>
                            {u.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {u.mustChangePassword && (
                            <AlertTriangle className="w-5 h-5 text-warning-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-secondary-600">
                          {u.managerName
                            ? `${u.managerName}${u.yardId ? ` — Yard #${u.yardId}` : ''}`
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingUser(u); setCredentialModalOpen(true) }}
                              className="p-2 text-secondary-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                              title="Edit Credentials"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {u.active ? (
                              <button
                                onClick={() => setDeactivateUserId(u.id)}
                                disabled={isSelf}
                                className="p-2 text-secondary-400 hover:text-error-500 rounded-lg hover:bg-error-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isSelf ? 'Cannot deactivate yourself' : 'Deactivate'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => activateMutation.mutate(u.id)}
                                className="p-2 text-secondary-400 hover:text-success-500 rounded-lg hover:bg-success-50"
                                title="Activate"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Tabs>
  ) : (
    // ---- MANAGER VIEW (non-superadmin) ----
    <div>
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
          description="No managers available to display"
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
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-light">
              {displayedManagers.map((m) => (
                <tr key={m.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4 font-medium text-secondary-800">{m.name}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.email}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.phone || '-'}</td>
                  <td className="px-6 py-4 text-secondary-600">{m.scrapYardName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <PageHeader title="Managers" description="Scrapyard manager management">
        {isSuperAdmin && activeTab === 'users' && (
          <div className="flex gap-2">
            <Button onClick={() => setNewManagerModalOpen(true)} variant="secondary">
              <Plus className="w-4 h-4" /> New Manager
            </Button>
            <Button onClick={() => setSuperAdminModalOpen(true)}>
              <Plus className="w-4 h-4" /> New Super Admin
            </Button>
          </div>
        )}
      </PageHeader>

      {pageContent}

      {/* ---- View Details Modal (SUPERADMIN) ---- */}
      <Modal
        open={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedManager(null) }}
        title="Manager Details"
      >
        {selectedManager && (
          <div className="space-y-4">
            <ReadOnlyField label="Name" value={selectedManager.name} />
            <ReadOnlyField label="Email" value={selectedManager.email} />
            <ReadOnlyField label="Phone" value={selectedManager.phone || '-'} />
            <ReadOnlyField label="Yard" value={selectedManager.scrapYardName} />
          </div>
        )}
      </Modal>

      {/* ---- Edit Credentials Modal ---- */}
      <Modal
        open={credentialModalOpen}
        onClose={() => { setCredentialModalOpen(false); setEditingUser(null) }}
        title="Edit Credentials"
      >
        <EditCredentialsForm
          user={editingUser}
          yards={yards || []}
          onSubmit={(data) => {
            if (editingUser) {
              editUserMutation.mutate({ userId: editingUser.id, ...data })
            }
          }}
          isLoading={editUserMutation.isPending}
          serverError={editUserMutation.error ? (editUserMutation.error as Error).message : ''}
        />
      </Modal>

      {/* ---- New Super Admin Modal ---- */}
      <Modal
        open={superAdminModalOpen}
        onClose={() => setSuperAdminModalOpen(false)}
        title="New Super Admin"
      >
        <NewSuperAdminForm
          onSubmit={(data) => createSuperAdminMutation.mutate(data)}
          isLoading={createSuperAdminMutation.isPending}
          serverError={createSuperAdminMutation.error ? (createSuperAdminMutation.error as Error).message : ''}
        />
      </Modal>

      {/* ---- New Manager Modal (User Accounts tab) ---- */}
      <Modal
        open={newManagerModalOpen}
        onClose={() => setNewManagerModalOpen(false)}
        title="New Manager"
      >
        <NewManagerForm
          yards={yards || []}
          onSubmit={(data) => createManagerMutation.mutate(data)}
          isLoading={createManagerMutation.isPending}
          serverError={createManagerMutation.error ? (createManagerMutation.error as Error).message : ''}
        />
      </Modal>

      {/* ---- Deactivate ConfirmDialog ---- */}
      <ConfirmDialog
        open={!!deactivateUserId}
        onClose={() => setDeactivateUserId(null)}
        onConfirm={() => deactivateUserId && deactivateMutation.mutate(deactivateUserId)}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will not be able to log in."
      />
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-secondary-500 mb-1">{label}</p>
      <p className="text-body-md text-secondary-800">{value}</p>
    </div>
  )
}

// ---- Edit Credentials Form ----
function EditCredentialsForm({
  user,
  yards,
  onSubmit,
  isLoading,
  serverError,
}: {
  user: UserListResponse | null
  yards: { id: number; name: string }[]
  onSubmit: (data: {
    userData: UserUpdateRequest
    profileData?: ManagerInsertData
    managerId?: number | null
  }) => void
  isLoading: boolean
  serverError: string
}) {
  const isManager = user?.role === 'MANAGER'

  const [email, setEmail] = useState(user?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [name, setName] = useState(user?.managerName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [yardId, setYardId] = useState(user?.yardId || 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user) return null

  const profileChanged =
    isManager &&
    (name !== user.managerName || phone !== user.phone || yardId !== user.yardId)
  const emailChanged = email !== user.email
  const passwordChanged = !!newPassword

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = 'Email required'
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) newErrors.email = 'Invalid email'
    if (newPassword && newPassword.length < 6) newErrors.newPassword = 'At least 6 characters'
    if (isManager) {
      if (!name.trim()) newErrors.name = 'Name required'
      if (!phone.trim()) newErrors.phone = 'Phone required'
      if (!yardId) newErrors.yardId = 'Select a yard'
    }
    if (!emailChanged && !passwordChanged && !profileChanged) {
      newErrors.form = 'No changes to apply'
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    const userData: UserUpdateRequest = {}
    if (emailChanged) userData.email = email
    if (passwordChanged) userData.newPassword = newPassword

    const profileData = profileChanged
      ? { name, email, phone, scrapYardId: yardId }
      : undefined

    onSubmit({
      userData,
      profileData,
      managerId: user.managerId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
          {serverError}
        </div>
      )}
      {errors.form && (
        <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
          {errors.form}
        </div>
      )}

      {isManager && (
        <>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Manager name"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="Phone number"
          />
          <Select
            label="Yard"
            value={yardId || ''}
            onChange={(e) => setYardId(Number(e.target.value))}
            error={errors.yardId}
          >
            <option value="">Select yard...</option>
            {yards.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </Select>
        </>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="email@example.com"
      />
      <Input
        label="New Password (leave blank to keep current)"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword}
        placeholder="At least 6 characters"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ---- New Super Admin Form ----
function NewSuperAdminForm({
  onSubmit,
  isLoading,
  serverError,
}: {
  onSubmit: (data: { email: string; password: string }) => void
  isLoading: boolean
  serverError: string
}) {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.email.trim()) newErrors.email = 'Email required'
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password required'
    else if (form.password.length < 6) newErrors.password = 'At least 6 characters'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSubmit({ email: form.email, password: form.password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
          {serverError}
        </div>
      )}
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="email@example.com"
      />
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
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

// ---- New Manager Form (User Accounts tab) ----
function NewManagerForm({
  yards,
  onSubmit,
  isLoading,
  serverError,
}: {
  yards: { id: number; name: string }[]
  onSubmit: (data: {
    email: string
    password: string
    name: string
    phone: string
    scrapYardId: number
  }) => void
  isLoading: boolean
  serverError: string
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
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
    if (!form.scrapYardId) newErrors.scrapYardId = 'Select a yard'
    if (!form.password) newErrors.password = 'Password required'
    else if (form.password.length < 6) newErrors.password = 'At least 6 characters'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    onSubmit({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      scrapYardId: form.scrapYardId,
    })
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
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
