interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  children,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-surface rounded-3xl shadow-elevation-4 p-6">
        <h3 className="text-title-lg text-secondary-800">{title}</h3>
        <p className="mt-2 text-body-md text-secondary-600">{message}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-label-lg text-secondary-700 bg-secondary-100 rounded-full hover:bg-secondary-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-label-lg text-white rounded-full cursor-pointer transition-colors ${
              variant === 'danger'
                ? 'bg-error-600 hover:bg-error-800 shadow-elevation-1'
                : 'bg-primary-500 hover:bg-primary-600 shadow-elevation-1'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
