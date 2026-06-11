import { useEffect, useRef } from 'react'
import type { Message } from '../../types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: Message[]
  isStreaming: boolean
  onRegenerate: () => void
}

export function MessageList({ messages, isStreaming, onRegenerate }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新消息 / 流式内容更新时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isLastAssistant={m.id === lastAssistantId}
            canRegenerate={!isStreaming}
            onRegenerate={onRegenerate}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
