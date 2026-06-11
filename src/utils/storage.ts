import type { Conversation } from '../types'

// 占位：Phase 4 实现 localStorage 持久化与导入导出。
// Phase 1 暂不接入订阅，仅提供签名以便后续填充。

const STORAGE_KEY = 'qwen_conversations'

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // Phase 4 处理超限等异常
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : []
  } catch {
    return []
  }
}
