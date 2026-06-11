// ===== 全局类型定义 =====

// 消息角色
export type Role = 'user' | 'assistant' | 'system'

// 多模态内容块（Phase 2 起会用到 image_url）
export interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

// 单条消息（content 为纯文本或多模态数组）
export interface Message {
  id: string
  role: Role
  content: string | ContentPart[]
  timestamp: number
  isStreaming?: boolean
  error?: boolean // 标记该条 assistant 消息是请求失败的错误文案
}

// 支持的模型
export type ModelId =
  | 'qwen-turbo'
  | 'qwen-plus'
  | 'qwen-max'
  | 'qwen-vl-plus'
  | 'qwen-vl-max'
  | 'qwen-long'

// 会话
export interface Conversation {
  id: string
  title: string
  model: ModelId
  messages: Message[]
  createdAt: number
  updatedAt: number
}

// 模型下拉选项
export interface ModelOption {
  id: ModelId
  name: string
  description: string
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'qwen-turbo', name: 'Qwen Turbo', description: '响应快，成本低，适合日常对话' },
  { id: 'qwen-plus', name: 'Qwen Plus', description: '均衡能力，推荐默认' },
  { id: 'qwen-max', name: 'Qwen Max', description: '最强推理，适合复杂任务' },
  { id: 'qwen-vl-plus', name: 'Qwen VL Plus', description: '视觉理解，中等质量' },
  { id: 'qwen-vl-max', name: 'Qwen VL Max', description: '视觉理解，最高质量' },
  { id: 'qwen-long', name: 'Qwen Long', description: '超长上下文（1M tokens）' },
]

export const DEFAULT_MODEL: ModelId = 'qwen-plus'

// 取消息纯文本（多模态时拼接文本块），供复制 / 标题生成等用
export function messageText(content: Message['content']): string {
  if (typeof content === 'string') return content
  return content
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('\n')
}
