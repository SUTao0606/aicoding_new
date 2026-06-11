import { create } from 'zustand'
import type { Conversation, Message, ModelId } from '../types'

function uid(): string {
  // crypto.randomUUID 在现代浏览器可用；做个保底
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null

  // 会话级
  createConversation: (model: ModelId) => string
  deleteConversation: (id: string) => void
  selectConversation: (id: string) => void
  setConversationModel: (id: string, model: ModelId) => void
  renameConversation: (id: string, title: string) => void
  getActiveConversation: () => Conversation | undefined

  // 消息级
  addMessage: (convId: string, message: Message) => void
  updateStreamingMessage: (convId: string, msgId: string, delta: string) => void
  finalizeMessage: (convId: string, msgId: string, patch?: Partial<Message>) => void
  removeMessage: (convId: string, msgId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,

  createConversation: (model) => {
    const now = Date.now()
    const conv: Conversation = {
      id: uid(),
      title: '新会话',
      model,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({
      conversations: [conv, ...s.conversations],
      activeConversationId: conv.id,
    }))
    return conv.id
  },

  deleteConversation: (id) =>
    set((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id)
      const activeConversationId =
        s.activeConversationId === id
          ? (conversations[0]?.id ?? null)
          : s.activeConversationId
      return { conversations, activeConversationId }
    }),

  selectConversation: (id) => set({ activeConversationId: id }),

  setConversationModel: (id, model) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, model, updatedAt: Date.now() } : c,
      ),
    })),

  renameConversation: (id, title) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
      ),
    })),

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get()
    return conversations.find((c) => c.id === activeConversationId)
  },

  addMessage: (convId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
          : c,
      ),
    })),

  updateStreamingMessage: (convId, msgId, delta) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === msgId && typeof m.content === 'string'
              ? { ...m, content: m.content + delta }
              : m,
          ),
        }
      }),
    })),

  finalizeMessage: (convId, msgId, patch) =>
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === msgId ? { ...m, isStreaming: false, ...patch } : m,
          ),
        }
      }),
    })),

  removeMessage: (convId, msgId) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) }
          : c,
      ),
    })),
}))
