import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backupApi } from '@/api/endpoints/backup'
import type { BackupFileInfo } from '@/types/models'
import {
  Download,
  Upload,
  Trash2,
  Database,
  AlertTriangle,
  FileArchive,
  RotateCcw,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { clearAuth } from '@/api/client'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Unknown'
  }
}

export default function BackupPage() {
  const queryClient = useQueryClient()

  const [restoreFile, setRestoreFile] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showWipeModal, setShowWipeModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [wipeConfirm, setWipeConfirm] = useState('')
  const [wipePassword, setWipePassword] = useState('')
  const [restoreConfirm, setRestoreConfirm] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: backupApi.listBackups,
  })

  const createMutation = useMutation({
    mutationFn: backupApi.createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setSuccessMsg('Backup created successfully')
      setTimeout(() => setSuccessMsg(''), 4000)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
      setTimeout(() => setErrorMsg(''), 4000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => backupApi.deleteBackup(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setSuccessMsg('Backup deleted')
      setTimeout(() => setSuccessMsg(''), 4000)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
      setTimeout(() => setErrorMsg(''), 4000)
    },
  })

  const wipeMutation = useMutation({
    mutationFn: () => backupApi.wipeData(wipeConfirm, wipePassword),
    onSuccess: () => {
      setShowWipeModal(false)
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      clearAuth()
      window.location.href = '/login'
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
      setTimeout(() => setErrorMsg(''), 4000)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => backupApi.restoreBackup(restoreFile, restoreConfirm, restorePassword),
    onSuccess: () => {
      setShowRestoreModal(false)
      setRestoreConfirm('')
      setRestorePassword('')
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setSuccessMsg('Backup restored successfully')
      setTimeout(() => setSuccessMsg(''), 4000)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
      setTimeout(() => setErrorMsg(''), 4000)
    },
  })

  const handleDownload = async (filename: string) => {
    try {
      const response = await backupApi.downloadBackup(filename)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Download failed')
      setTimeout(() => setErrorMsg(''), 4000)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      await backupApi.uploadBackup(uploadFile)
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['backups'] })
      setSuccessMsg('Backup uploaded successfully')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: unknown) {
      console.error('Upload failed:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
      setTimeout(() => setErrorMsg(''), 4000)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-headline-md font-semibold text-secondary-800">Backup & System Management</h1>
        <p className="text-body-md text-secondary-600 mt-1">
          Create, restore, and manage database backups. All actions require superadmin confirmation.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-success-50 border border-success-100 text-success-600">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-body-md">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-error-50 border border-error-100 text-error-600">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-body-md">{errorMsg}</span>
        </div>
      )}

      {/* EXPORT SECTION */}
      <section className="rounded-xl border border-outline-light bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-primary-400" />
          <h2 className="text-title-lg font-semibold text-secondary-800">Export</h2>
        </div>
        <p className="text-body-md text-secondary-600 mb-4">
          Create a full database backup and download it as a compressed archive.
        </p>

        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          variant="primary"
          className="mb-6"
        >
          {createMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating Backup...</>
          ) : (
            <><FileArchive className="w-4 h-4" /> Create New Backup</>
          )}
        </Button>

        <h3 className="text-label-lg font-medium text-secondary-800 mb-3">Available Backups</h3>
        {isLoading ? (
          <div className="flex items-center gap-2 text-secondary-600 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading backups...
          </div>
        ) : backups.length === 0 ? (
          <p className="text-body-md text-secondary-600 py-4">No backups available.</p>
        ) : (
          <div className="space-y-2">
            {backups.map((b: BackupFileInfo) => (
              <div
                key={b.filename}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-100 border border-outline-light"
              >
                <div className="min-w-0">
                  <p className="text-label-lg font-medium text-secondary-800 truncate">{b.filename}</p>
                  <p className="text-body-sm text-secondary-600">
                    {formatBytes(b.sizeBytes)} &middot; {formatDate(b.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(b.filename)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(b.filename)}
                    title="Delete"
                    className="text-error-400 hover:text-error-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RESTORE SECTION */}
      <section className="rounded-xl border border-outline-light bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <RotateCcw className="w-6 h-6 text-warning-500" />
          <h2 className="text-title-lg font-semibold text-secondary-800">Restore</h2>
        </div>
        <p className="text-body-md text-secondary-600 mb-4">
          Restore the system from a previously created backup. This will overwrite all current data.
        </p>

        <div className="space-y-5">
          {/* Restore from server backup */}
          <div>
            <label className="text-label-lg font-medium text-secondary-800 block mb-2">
              Restore from server backup
            </label>
            <div className="flex items-center gap-3">
              <select
                value={restoreFile}
                onChange={(e) => setRestoreFile(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Select a backup --</option>
                {backups.map((b: BackupFileInfo) => (
                  <option key={b.filename} value={b.filename}>
                    {b.filename} ({formatBytes(b.sizeBytes)})
                  </option>
                ))}
              </select>
              <Button
                onClick={() => {
                  setRestoreConfirm('')
                  setRestorePassword('')
                  setShowRestoreModal(true)
                }}
                disabled={!restoreFile}
                variant="primary"
              >
                <RotateCcw className="w-4 h-4" /> Restore
              </Button>
            </div>
          </div>

          {/* Upload backup file */}
          <div className="pt-4 border-t border-outline-light">
            <label className="text-label-lg font-medium text-secondary-800 block mb-2">
              Upload a backup file (.zip)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-body-md text-secondary-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-label-md file:font-medium
                  file:bg-primary-50 file:text-primary-500
                  hover:file:bg-primary-100
                  cursor-pointer"
              />
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                variant="secondary"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DELETE SECTION */}
      <section className="rounded-xl border border-error-500 bg-error-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-error-600" />
          <h2 className="text-title-lg font-semibold text-error-600">Delete</h2>
        </div>
        <p className="text-body-md text-secondary-600 mb-4">
          Danger zone. These actions are irreversible. All business data will be permanently erased.
          Only the superadmin account is preserved.
        </p>

        <Button
          onClick={() => {
            setWipeConfirm('')
            setWipePassword('')
            setShowWipeModal(true)
          }}
          variant="danger"
        >
          <Trash2 className="w-4 h-4" /> Wipe All Data
        </Button>
      </section>

      {/* WIPE MODAL */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowWipeModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-3xl shadow-elevation-4 p-6 space-y-4 animate-[fadeIn_200ms_ease-emphasized]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-error-600" />
              <h3 className="text-title-lg font-semibold text-error-600">Confirm Wipe</h3>
            </div>
            <p className="text-body-md text-secondary-600">
              This will delete <strong>ALL</strong> business records. Only the superadmin account is preserved.
              This action cannot be undone.
            </p>
            <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 space-y-1 text-body-sm">
              <p className="font-medium text-primary-600">Your session will close after wiping.</p>
              <p className="text-primary-600">Login again with these credentials:</p>
              <p className="font-mono text-primary-600">
                Email: admin@scrapyard.com<br />
                Password: admin123
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  Type <code className="bg-surface-100 px-1.5 py-0.5 rounded text-error-600">DELETE</code> to confirm
                </label>
                <input
                  type="text"
                  value={wipeConfirm}
                  onChange={(e) => setWipeConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-error-500"
                  placeholder="DELETE"
                />
              </div>
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  Enter your admin password
                </label>
                <input
                  type="password"
                  value={wipePassword}
                  onChange={(e) => setWipePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-error-500"
                  placeholder="Your password"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowWipeModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={wipeConfirm !== 'DELETE' || !wipePassword || wipeMutation.isPending}
                onClick={() => wipeMutation.mutate()}
              >
                {wipeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Wiping...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Confirm Wipe</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRestoreModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface rounded-3xl shadow-elevation-4 p-6 space-y-4 animate-[fadeIn_200ms_ease-emphasized]">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-warning-500" />
              <h3 className="text-title-lg font-semibold text-warning-600">Confirm Restore</h3>
            </div>
            <p className="text-body-md text-secondary-600">
              Restoring from <strong>{restoreFile}</strong> will overwrite all current data.
              This action cannot be undone.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  Type <code className="bg-surface-100 px-1.5 py-0.5 rounded text-warning-600">RESTORE</code> to confirm
                </label>
                <input
                  type="text"
                  value={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-warning-500"
                  placeholder="RESTORE"
                />
              </div>
              <div>
                <label className="text-label-lg font-medium text-secondary-800 block mb-1">
                  Enter your admin password
                </label>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-light bg-surface-100 text-secondary-800 text-body-md focus:outline-none focus:ring-2 focus:ring-warning-500"
                  placeholder="Your password"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={restoreConfirm !== 'RESTORE' || !restorePassword || restoreMutation.isPending}
                onClick={() => restoreMutation.mutate()}
              >
                {restoreMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Restoring...</>
                ) : (
                  <><RotateCcw className="w-4 h-4" /> Confirm Restore</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
