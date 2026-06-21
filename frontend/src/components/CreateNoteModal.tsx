import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messagesApi } from '@/api/endpoints/messages'
import { Modal, Button, LoadingSpinner } from '@/components/ui'
import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recipient } from '@/types/models'

interface CreateNoteModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export function CreateNoteModal({ open, onClose, onSubmit }: CreateNoteModalProps) {
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { data: recipients, isLoading } = useQuery({
    queryKey: ['messages', 'recipients'],
    queryFn: messagesApi.getRecipients,
    enabled: open,
  })

  const handleSubmit = async () => {
    setError('')

    if (!selectedRecipientId) {
      setError('Please select a recipient')
      return
    }

    if (!content.trim()) {
      setError('Please write a note')
      return
    }

    if (content.length > 500) {
      setError('Note must be at most 500 characters')
      return
    }

    setSubmitting(true)
    try {
      await messagesApi.create({
        recipientId: selectedRecipientId,
        content: content.trim(),
        pinned,
      })
      setContent('')
      setSelectedRecipientId(null)
      setPinned(false)
      onSubmit()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to send note')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setError('')
    setContent('')
    setSelectedRecipientId(null)
    setPinned(false)
    onClose()
  }

  const selectedRecipient = recipients?.find((r) => r.id === selectedRecipientId)

  return (
    <Modal open={open} onClose={handleClose} title="Send a Note" size="md">
      <div className="space-y-5">
        {error && (
          <div className="bg-error-50 text-error-700 text-sm p-3 rounded-xl border border-error-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-label-md text-secondary-700 mb-1.5">
            Send to
          </label>
          {isLoading ? (
            <LoadingSpinner />
          ) : !recipients?.length ? (
            <p className="text-sm text-secondary-400">No available recipients</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-outline p-1">
              {recipients.map((recipient: Recipient) => (
                <button
                  key={recipient.id}
                  type="button"
                  onClick={() => setSelectedRecipientId(recipient.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3',
                    selectedRecipientId === recipient.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-surface-100 border border-transparent'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-secondary-500 font-medium text-xs shrink-0">
                    {recipient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary-800 truncate">{recipient.name}</p>
                    <p className="text-xs text-secondary-400">
                      {recipient.role === 'SUPERADMIN' ? 'Super Admin' : `Manager${recipient.yardName ? ` · ${recipient.yardName}` : ''}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedRecipient && (
            <p className="mt-1.5 text-xs text-primary-600">
              Sending to: <strong>{selectedRecipient.name}</strong>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="note-content" className="block text-label-md text-secondary-700 mb-1.5">
            Note
          </label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            maxLength={500}
            rows={4}
            className="w-full rounded-lg border border-outline bg-surface px-4 py-3 text-body-md text-secondary-800 placeholder:text-secondary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <div className="flex justify-between mt-1.5">
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={cn(
                'flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-colors',
                pinned
                  ? 'text-amber-600 bg-amber-50 border border-amber-200'
                  : 'text-secondary-400 hover:text-secondary-600 hover:bg-surface-100 border border-transparent'
              )}
            >
              <Pin className="w-3.5 h-3.5" />
              {pinned ? 'Pinned' : 'Pin as important'}
            </button>
            <span className={cn('text-xs', content.length > 450 ? 'text-amber-500' : 'text-secondary-400')}>
              {content.length}/500
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Note'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
