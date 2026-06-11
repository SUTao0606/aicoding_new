import { useEffect, useRef, type ReactNode } from 'react'
import { hasImage, type Message } from '../../types'
import { MessageBubble } from './MessageBubble'
import { ImageAnalysisCard } from './ImageAnalysisCard'

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

  // 渲染：含图片的 user 消息 + 紧随的 assistant 回复 → 合并为图片分析卡片
  const rendered: ReactNode[] = []
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    const next = messages[i + 1]

    if (m.role === 'user' && hasImage(m.content) && next && next.role === 'assistant') {
      rendered.push(
        <ImageAnalysisCard
          key={m.id}
          userMessage={m}
          assistantMessage={next}
          canRegenerate={!isStreaming && next.id === lastAssistantId}
          onRegenerate={onRegenerate}
        />,
      )
      i++ // 跳过已合并的 assistant 消息
      continue
    }

    rendered.push(
      <MessageBubble
        key={m.id}
        message={m}
        isLastAssistant={m.id === lastAssistantId}
        canRegenerate={!isStreaming}
        onRegenerate={onRegenerate}
      />,
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {rendered}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
