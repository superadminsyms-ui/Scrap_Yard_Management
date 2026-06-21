import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Pin, CheckCheck, ChevronRight, Plus } from 'lucide-react'
import { messagesApi } from '@/api/endpoints/messages'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { CreateNoteModal } from '@/components/CreateNoteModal'

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: unreadData } = useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: messagesApi.getUnreadCount,
    refetchInterval: 30000,
    enabled: !!user,
  })

  const { data: recentData } = useQuery({
    queryKey: ['messages', 'recent'],
    queryFn: () => messagesApi.getReceived(true, { page: 0, size: 5 }),
    enabled: !!user && open,
  })

  const unreadCount = unreadData?.unreadCount ?? 0

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await messagesApi.markAsRead(id)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const handleMarkAllAsRead = async () => {
    await messagesApi.markAllAsRead()
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const handleTogglePin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await messagesApi.togglePin(id)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const handleNoteCreated = () => {
    setShowCreateModal(false)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  }

  const recentMessages = recentData?.content ?? []

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            open
              ? 'bg-primary-50 text-primary-600'
              : 'text-secondary-400 hover:text-secondary-600 hover:bg-surface-100'
          )}
          title="Messages"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-error-500 rounded-full ring-2 ring-surface">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-surface rounded-2xl border border-outline shadow-elevation-3 animate-[fadeIn_150ms_ease-emphasized] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-outline-light">
                <h3 className="text-label-lg font-semibold text-secondary-800">Messages</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {recentMessages.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-secondary-400">No unread messages</p>
                  </div>
                ) : (
                  recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="px-5 py-3 border-b border-outline-light last:border-0 hover:bg-surface-50 cursor-pointer transition-colors"
                      onClick={() => navigate('/app/messages')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            {msg.pinned && (
                              <Pin className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                            <span className="text-xs font-medium text-secondary-500">
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] text-secondary-300">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-800 truncate">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={(e) => handleTogglePin(msg.id, e)}
                            className={cn(
                              'p-1 rounded-md transition-colors',
                              msg.pinned
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-secondary-300 hover:text-secondary-500 hover:bg-surface-100'
                            )}
                            title={msg.pinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleMarkAsRead(msg.id, e)}
                            className="p-1 text-secondary-300 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-outline-light p-2 flex gap-2">
                <button
                  onClick={() => { navigate('/app/messages'); setOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-secondary-600 hover:bg-surface-100 transition-colors"
                >
                  View all
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setShowCreateModal(true); setOpen(false) }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New note
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateNoteModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNoteCreated}
      />
    </>
  )
}
