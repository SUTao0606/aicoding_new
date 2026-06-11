import type { Conversation, Message } from '../types'
import { useToastStore } from '../store/toastStore'

export const STORAGE_KEY = 'qwen_conversations'

/**
 * 持久化前剔除 base64 图片：base64 大图会撑爆 localStorage（~5MB）。
 * 把多模态 content 里的 image_url 块替换为占位文本块，保留文字与对话结构。
 */
export function stripImages(conversations: Conversation[]): Conversation[] {
  return conversations.map((c) => ({
    ...c,
    messages: c.messages.map(stripMessageImages),
  }))
}

function stripMessageImages(m: Message): Message {
  if (!Array.isArray(m.content)) return m
  const content = m.content.map((part) =>
    part.type === 'image_url' ? { type: 'text' as const, text: '[图片]' } : part,
  )
  return { ...m, content }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripImages(conversations)))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      useToastStore.getState().showToast('历史保存失败：本地存储空间不足', 'error')
    }
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

/** 生成 qwen_history_YYYYMMDD.json 并触发下载 */
export function exportConversations(conversations: Conversation[]): void {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`
  const blob = new Blob([JSON.stringify(conversations, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qwen_history_${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 读取并解析导入的 JSON 文件，校验为 Conversation 数组 */
export async function parseImportFile(file: File): Promise<Conversation[]> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('文件不是合法的 JSON')
  }
  if (!Array.isArray(data)) {
    throw new Error('文件格式不正确：应为会话数组')
  }
  const valid = data.filter(
    (c): c is Conversation =>
      typeof c === 'object' &&
      c !== null &&
      typeof (c as Conversation).id === 'string' &&
      Array.isArray((c as Conversation).messages),
  )
  if (valid.length === 0) {
    throw new Error('文件中没有有效的会话数据')
  }
  return valid
}
