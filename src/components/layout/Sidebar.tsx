import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Download, MessageSquare, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useSettingStore } from '../../store/settingStore'
import { useToastStore } from '../../store/toastStore'
import { exportConversations, parseImportFile } from '../../utils/storage'

export function Sidebar() {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeConversationId)
  const createConversation = useChatStore((s) => s.createConversation)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const renameConversation = useChatStore((s) => s.renameConversation)
  const importConversations = useChatStore((s) => s.importConversations)
  const currentModel = useSettingStore((s) => s.currentModel)
  const showToast = useToastStore((s) => s.showToast)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 按创建时间倒序
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.createdAt - a.createdAt),
    [conversations],
  )

  const startEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title)
  }
  const commitEdit = () => {
    if (editingId) {
      const title = editValue.trim()
      if (title) renameConversation(editingId, title)
    }
    setEditingId(null)
  }
  const handleEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const handleExport = () => {
    if (conversations.length === 0) {
      showToast('暂无会话可导出', 'error')
      return
    }
    exportConversations(conversations)
    showToast(`已导出 ${conversations.length} 个会话`)
  }

  const handleImportPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const incoming = await parseImportFile(file)
      const { added, skipped } = importConversations(incoming)
      showToast(`已导入 ${added} 个会话${skipped > 0 ? `（跳过 ${skipped} 个重复）` : ''}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '导入失败', 'error')
    }
  }

  const deleteTarget = conversations.find((c) => c.id === pendingDelete)

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="p-3">
        <button
          type="button"
          onClick={() => createConversation(currentModel)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          新建会话
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {sorted.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">暂无会话</p>
        ) : (
          sorted.map((c) => {
            const active = c.id === activeId
            const editing = c.id === editingId
            return (
              <div
                key={c.id}
                onClick={() => !editing && selectConversation(c.id)}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                  active ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                {editing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKey}
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0 flex-1 rounded border border-indigo-300 bg-white px-1 py-0.5 text-sm outline-none"
                  />
                ) : (
                  <span
                    className="flex-1 truncate"
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      startEdit(c.id, c.title)
                    }}
                  >
                    {c.title}
                  </span>
                )}

                {!editing && (
                  <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      title="重命名"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEdit(c.id, c.title)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-indigo-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="删除会话"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingDelete(c.id)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </nav>

      {/* 底部：导出 / 导入 */}
      <div className="flex gap-2 border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={handleExport}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          导出全部
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
        >
          <Upload className="h-3.5 w-3.5" />
          导入
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportPick}
        />
      </div>

      {/* 删除二次确认 */}
      <Dialog.Root open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/40" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-[91] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-2xl"
          >
            <Dialog.Title className="text-base font-semibold text-gray-800">删除会话</Dialog.Title>
            <p className="mt-2 text-sm text-gray-500">
              确定删除「{deleteTarget?.title ?? ''}」吗？此操作无法撤销。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={() => {
                  if (pendingDelete) deleteConversation(pendingDelete)
                  setPendingDelete(null)
                }}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </aside>
  )
}
