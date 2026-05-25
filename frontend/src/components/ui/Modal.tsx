import { type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative z-10 w-full ${sizes[size]} mx-4`}>
        <div className="bg-surface rounded-3xl shadow-elevation-4 animate-[fadeIn_200ms_ease-emphasized] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-light">
            <h2 className="text-title-lg text-secondary-800">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
