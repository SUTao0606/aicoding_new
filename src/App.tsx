import { useEffect, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { ChatArea } from './components/layout/ChatArea'
import { Toaster } from './components/ui/Toaster'
import { useTheme } from './hooks/useTheme'
import { useChatStore } from './store/chatStore'

function App() {
  useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 页面标题跟随当前会话
  const activeConv = useChatStore((s) =>
    s.conversations.find((c) => c.id === s.activeConversationId),
  )
  useEffect(() => {
    document.title = activeConv?.title ? `${activeConv.title} · 千问 Chat` : '千问 Chat'
  }, [activeConv?.title])

  // 全局快捷键：Ctrl+N 新建会话，Ctrl+/ 聚焦输入框
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'n') {
        e.preventDefault()
        const { createConversation } = useChatStore.getState()
        createConversation(useChatStore.getState().conversations[0]?.model ?? 'qwen-plus')
      } else if (e.key === '/') {
        e.preventDefault()
        document.getElementById('chat-input')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ChatArea onOpenSidebar={() => setSidebarOpen(true)} />
      <Toaster />
    </div>
  )
}

export default App
