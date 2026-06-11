import { Sparkles } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useChat } from '../../hooks/useChat'
import { TopBar } from './TopBar'
import { MessageList } from '../chat/MessageList'
import { InputBar } from '../chat/InputBar'

const SUGGESTIONS = [
  '用表格对比 Python 和 Go 的优缺点',
  '写一个快速排序的 TypeScript 实现',
  '列出从零搭建 React 项目的步骤',
]

export function ChatArea() {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeConversationId)
  const activeConv = conversations.find((c) => c.id === activeId)
  const { isStreaming, send, stop, regenerate } = useChat()

  const hasMessages = !!activeConv && activeConv.messages.length > 0

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
      <TopBar />

      {hasMessages ? (
        <MessageList
          messages={activeConv!.messages}
          isStreaming={isStreaming}
          onRegenerate={regenerate}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
            <Sparkles className="h-7 w-7 text-indigo-500" />
          </div>
          <h1 className="mb-1 text-xl font-semibold text-gray-800">千问 Chat</h1>
          <p className="mb-6 text-sm text-gray-400">输入消息开始对话，或试试下面的提示词</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <InputBar isStreaming={isStreaming} onSend={send} onStop={stop} />
    </div>
  )
}
