import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi, type MessagePageParams } from '@/api/endpoints/messages'
import { PageHeader, Tabs, Badge, LoadingSpinner, EmptyState, Button } from '@/components/ui'
import { Pin, CheckCheck, Trash2, Plus, Mail, Send, Star, Inbox, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateNoteModal } from '@/components/CreateNoteModal'
import type { Message, PageResponse } from '@/types/models'

type MessageFilter = 'all' | 'received' | 'sent' | 'unread' | 'pinned'

export default function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const pageParams: MessagePageParams = { page, size: 20, sortBy: 'createdAt', direction: 'desc' }

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['messages', 'all', page],
    queryFn: () => messagesApi.getAll(pageParams),
    enabled: activeFilter === 'all',
  })

  const { data: receivedData, isLoading: receivedLoading } = useQuery({
    queryKey: ['messages', 'received', page],
    queryFn: () => messagesApi.getReceived(false, pageParams),
    enabled: activeFilter === 'received',
  })

  const { data: sentData, isLoading: sentLoading } = useQuery({
    queryKey: ['messages', 'sent', page],
    queryFn: () => messagesApi.getSent(pageParams),
    enabled: activeFilter === 'sent',
  })

  const { data: unreadData, isLoading: unreadLoading } = useQuery({
    queryKey: ['messages', 'unread', page],
    queryFn: () => messagesApi.getReceived(true, pageParams),
    enabled: activeFilter === 'unread',
  })

  const { data: pinnedData, isLoading: pinnedLoading } = useQuery({
    queryKey: ['messages', 'pinned', page],
    queryFn: () => messagesApi.getAll({ ...pageParams, size: 100 }),
    enabled: activeFilter === 'pinned',
    select: (data) => ({
      ...data,
      content: data.content.filter((m) => m.pinned),
    }),
  })

  const isLoading = allLoading || receivedLoading || sentLoading || unreadLoading || pinnedLoading
  const currentData = activeFilter === 'all' ? allData :
    activeFilter === 'received' ? receivedData :
    activeFilter === 'sent' ? sentData :
    activeFilter === 'unread' ? unreadData : pinnedData

  const messages = currentData?.content ?? []
  const totalPages = (currentData as { totalPages?: number })?.totalPages ?? 1

  const handleMarkAsRead = async (id: number) => {
    await messagesApi.markAsRead(id)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const handleDelete = async (id: number) => {
    const queries = queryClient.getQueryCache().findAll({ queryKey: ['messages'] })
    const snapshots = new Map(queries.map((q) => [q.queryHash, q.state.data]))

    queries.forEach(({ queryKey }) => {
      queryClient.setQueryData(queryKey, (old: PageResponse<Message> | undefined) => {
        if (!old?.content) return old
        return { ...old, content: old.content.filter((m) => m.id !== id) }
      })
    })

    try {
      await messagesApi.delete(id)
    } catch {
      snapshots.forEach((data, queryHash) => {
        const q = queryClient.getQueryCache().findAll({ queryKey: ['messages'] })
        const found = q.find((x) => x.queryHash === queryHash)
        if (found) queryClient.setQueryData(found.queryKey, data)
      })
    }
  }

  const handleTogglePin = async (id: number) => {
    await messagesApi.togglePin(id)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const handleNoteCreated = () => {
    setShowCreateModal(false)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const filters = [
    { key: 'all' as MessageFilter, label: 'All', icon: Mail },
    { key: 'received' as MessageFilter, label: 'Received', icon: Inbox },
    { key: 'sent' as MessageFilter, label: 'Sent', icon: Send },
    { key: 'unread' as MessageFilter, label: 'Unread', icon: EyeOff },
    { key: 'pinned' as MessageFilter, label: 'Pinned', icon: Star },
  ]

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Notes and reminders between team members"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setPage(0) }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors',
                activeFilter === f.key
                  ? 'bg-primary-500 text-white shadow-elevation-1'
                  : 'bg-surface text-secondary-600 border border-outline hover:border-primary-300 hover:text-primary-600'
              )}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <EmptyState
          title={activeFilter === 'sent' ? 'No sent messages' : activeFilter === 'unread' ? 'No unread messages' : 'No messages'}
          description={activeFilter === 'sent' ? 'Send a note to a team member' : 'Start by sending a note to a colleague'}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline shadow-elevation-1 overflow-hidden">
          <div className="divide-y divide-outline-light">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'px-6 py-4 hover:bg-surface-50 transition-colors',
                  !msg.read && 'bg-secondary-50/50'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {msg.pinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-secondary-800">
                        From:{' '}
                        <span className="text-secondary-600">{msg.senderName}</span>
                      </span>
                      <Badge variant={msg.senderRole === 'SUPERADMIN' ? 'blue' : 'green'}>
                        {msg.senderRole === 'SUPERADMIN' ? 'Admin' : 'Manager'}
                      </Badge>
                      <span className="text-sm text-secondary-400">&rarr;</span>
                      <span className="text-sm font-medium text-secondary-800">
                        To:{' '}
                        <span className="text-secondary-600">{msg.recipientName}</span>
                      </span>
                      <Badge variant={msg.recipientRole === 'SUPERADMIN' ? 'blue' : 'green'}>
                        {msg.recipientRole === 'SUPERADMIN' ? 'Admin' : 'Manager'}
                      </Badge>
                      <span className="text-xs text-secondary-300">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 mt-1">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!msg.read && msg.recipientId !== undefined && (
                      <button
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="p-1.5 text-secondary-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleTogglePin(msg.id)}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        msg.pinned
                          ? 'text-amber-500 hover:bg-amber-50'
                          : 'text-secondary-400 hover:text-secondary-600 hover:bg-surface-100'
                      )}
                      title={msg.pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 text-secondary-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-secondary-600">
          <span>
            Showing {messages.length} of {currentData?.totalElements ?? messages.length} messages
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="px-2">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateNoteModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNoteCreated}
      />
    </div>
  )
}
