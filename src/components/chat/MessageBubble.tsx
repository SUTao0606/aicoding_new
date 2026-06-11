import { useState } from 'react'
import { Check, Copy, RotateCcw, User, Sparkles } from 'lucide-react'
import { messageImages, messageText, type Message } from '../../types'
import { copyText } from '../../utils/clipboard'
import { Markdown } from './Markdown'

interface Props {
  message: Message
  /** 是否为列表中最后一条 assistant 消息（决定是否显示「重新生成」） */
  isLastAssistant: boolean
  canRegenerate: boolean
  onRegenerate: () => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function MessageBubble({ message, isLastAssistant, canRegenerate, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const text = messageText(message.content)
  const images = messageImages(message.content)

  const handleCopy = async () => {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像 */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-indigo-600' : 'bg-emerald-500'
        } text-white`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className={`group flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'bg-indigo-600 text-white'
              : message.error
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          {isUser ? (
            <div className="flex flex-col gap-2">
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`图片 ${i + 1}`}
                      className="max-h-48 max-w-[200px] rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {text && <div className="whitespace-pre-wrap break-words">{text}</div>}
            </div>
          ) : (
            <div
              className={`markdown-body ${
                message.isStreaming && text.length === 0 ? 'streaming-cursor min-h-[1.2em]' : ''
              } ${message.isStreaming && text.length > 0 ? 'streaming-cursor' : ''}`}
            >
              <Markdown>{text}</Markdown>
            </div>
          )}
        </div>

        {/* 工具栏 + 时间戳 */}
        <div
          className={`mt-1 flex items-center gap-2 text-xs text-gray-400 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>

          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={handleCopy}
                title="复制"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-600"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">已复制</span>
                  </>
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {isLastAssistant && canRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  title="重新生成"
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>重新生成</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
