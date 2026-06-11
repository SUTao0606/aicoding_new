import { useRef, useState, type KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'

interface Props {
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
}

export function InputBar({ isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const autoGrow = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }

  const submit = () => {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue('')
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto'
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送 / Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autoGrow()
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isStreaming}
          placeholder={isStreaming ? '正在生成回复…' : '输入消息，Enter 发送，Shift+Enter 换行'}
          className="max-h-[200px] flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="停止生成"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim()}
            title="发送"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
