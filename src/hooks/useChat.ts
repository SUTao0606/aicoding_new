import { useCallback, useRef, useState } from 'react'
import { useChatStore } from '../store/chatStore'
import { useSettingStore } from '../store/settingStore'
import { streamChat, isAbortError } from '../api/chat'
import type { Message } from '../types'

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * 发送 / 停止 / 重新生成 的编排逻辑。
 * - send(text): 在当前会话追加用户消息 + assistant 占位，发起流式请求。
 * - stop(): 中断当前流式请求。
 * - regenerate(): 删除最后一条 assistant 回复，基于其之前的历史重新请求。
 */
export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const runStream = useCallback(async (convId: string) => {
    const store = useChatStore.getState()
    const conv = store.conversations.find((c) => c.id === convId)
    if (!conv) return

    // 用于请求的历史：截止到最后一条非占位消息
    const history = conv.messages.filter((m) => !m.isStreaming)

    const assistantId = uid()
    const placeholder: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    }
    store.addMessage(convId, placeholder)

    const controller = new AbortController()
    abortRef.current = controller
    setIsStreaming(true)

    const { temperature } = useSettingStore.getState()

    try {
      await streamChat(
        history,
        conv.model,
        (delta) => useChatStore.getState().updateStreamingMessage(convId, assistantId, delta),
        { temperature, signal: controller.signal },
      )
      useChatStore.getState().finalizeMessage(convId, assistantId)
    } catch (err) {
      if (isAbortError(err)) {
        // 停止生成：保留已生成内容，仅清理 streaming 状态
        useChatStore.getState().finalizeMessage(convId, assistantId)
      } else {
        const msg = err instanceof Error ? err.message : '请求失败，请重试。'
        useChatStore
          .getState()
          .finalizeMessage(convId, assistantId, { content: `⚠️ ${msg}`, error: true })
      }
    } finally {
      abortRef.current = null
      setIsStreaming(false)
    }
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const store = useChatStore.getState()
      let convId = store.activeConversationId
      if (!convId) {
        convId = store.createConversation(useSettingStore.getState().currentModel)
      }

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }
      store.addMessage(convId, userMsg)

      // 首条用户消息 → 自动生成会话标题（取前 20 字）
      const conv = useChatStore.getState().conversations.find((c) => c.id === convId)
      if (conv && conv.messages.filter((m) => m.role === 'user').length === 1) {
        store.renameConversation(convId, trimmed.slice(0, 20) || '新会话')
      }

      await runStream(convId)
    },
    [isStreaming, runStream],
  )

  const regenerate = useCallback(async () => {
    if (isStreaming) return
    const store = useChatStore.getState()
    const convId = store.activeConversationId
    if (!convId) return
    const conv = store.conversations.find((c) => c.id === convId)
    if (!conv) return

    // 找到最后一条 assistant 消息并删除，然后基于剩余历史重新请求
    const lastAssistant = [...conv.messages].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant) return
    store.removeMessage(convId, lastAssistant.id)

    await runStream(convId)
  }, [isStreaming, runStream])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { isStreaming, send, stop, regenerate }
}
