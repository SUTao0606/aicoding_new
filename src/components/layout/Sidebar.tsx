import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useSettingStore } from '../../store/settingStore'

export function Sidebar() {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeConversationId)
  const createConversation = useChatStore((s) => s.createConversation)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const currentModel = useSettingStore((s) => s.currentModel)

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
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">暂无会话</p>
        ) : (
          conversations.map((c) => {
            const active = c.id === activeId
            return (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                  active ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  type="button"
                  title="删除会话"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(c.id)
                  }}
                  className="shrink-0 rounded p-1 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}
