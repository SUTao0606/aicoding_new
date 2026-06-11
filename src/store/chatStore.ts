import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Conversation, Message, ModelId } from '../types'
import { STORAGE_KEY, stripImages } from '../utils/storage'

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
  // 导入：按 id 去重合并（跳过已存在），返回 [导入数, 跳过数]
  importConversations: (incoming: Conversation[]) => { added: number; skipped: number }

  // 消息级
  addMessage: (convId: string, message: Message) => void
  updateStreamingMessage: (convId: string, msgId: string, delta: string) => void
  finalizeMessage: (convId: string, msgId: string, patch?: Partial<Message>) => void
  removeMessage: (convId: string, msgId: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
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

  importConversations: (incoming) => {
    const existing = new Set(get().conversations.map((c) => c.id))
    const fresh = incoming.filter((c) => !existing.has(c.id))
    if (fresh.length > 0) {
      set((s) => ({
        conversations: [...s.conversations, ...fresh].sort((a, b) => b.createdAt - a.createdAt),
      }))
    }
    return { added: fresh.length, skipped: incoming.length - fresh.length }
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
    }),
    {
      name: STORAGE_KEY,
      // 持久化前剔除 base64 图片，避免撑爆 localStorage
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            const parsed = JSON.parse(value) as {
              state: { conversations: Conversation[] }
            }
            parsed.state.conversations = stripImages(parsed.state.conversations)
            localStorage.setItem(name, JSON.stringify(parsed))
          } catch {
            localStorage.setItem(name, value)
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (s) => ({
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
      }),
    },
  ),
)
