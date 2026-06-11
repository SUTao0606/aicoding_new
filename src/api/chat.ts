import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from 'openai/resources/chat/completions'
import type { Message, ModelId } from '../types'

const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY as string | undefined

const client = new OpenAI({
  apiKey: apiKey ?? '',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  dangerouslyAllowBrowser: true, // 本地开发可接受（无后端代理）
})

// 把内部 Message 映射为 OpenAI 兼容格式。
// content 为字符串时直接透传；为多模态数组时映射为 OpenAI 的 content parts（Phase 2 VL）。
function toApiMessage(m: Message): ChatCompletionMessageParam {
  if (typeof m.content === 'string') {
    return { role: m.role, content: m.content } as ChatCompletionMessageParam
  }
  const parts: ChatCompletionContentPart[] = m.content.map((p) =>
    p.type === 'image_url'
      ? { type: 'image_url', image_url: { url: p.image_url!.url } }
      : { type: 'text', text: p.text ?? '' },
  )
  return { role: m.role, content: parts } as ChatCompletionMessageParam
}

export interface StreamChatOptions {
  temperature?: number
  signal?: AbortSignal
}

/**
 * 流式对话。逐 chunk 调用 onChunk(delta)。
 * 抛出的 Error.message 为可读的错误信息。
 */
export async function streamChat(
  messages: Message[],
  model: ModelId,
  onChunk: (delta: string) => void,
  options: StreamChatOptions = {},
): Promise<void> {
  if (!apiKey) {
    throw new Error('未配置 API Key，请在 .env 中设置 VITE_DASHSCOPE_API_KEY 后重启 dev server。')
  }

  try {
    const stream = await client.chat.completions.create(
      {
        model,
        messages: messages.map(toApiMessage),
        temperature: options.temperature,
        stream: true,
      },
      { signal: options.signal },
    )

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) onChunk(delta)
    }
  } catch (err) {
    // 主动中断（停止生成）：向上抛出可识别的 AbortError，由调用方区分处理
    if (isAbortError(err)) {
      const e = new Error('aborted', { cause: err })
      e.name = 'AbortError'
      throw e
    }
    throw new Error(toReadableError(err), { cause: err })
  }
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && err.name === 'AbortError') ||
    (err instanceof DOMException && err.name === 'AbortError') ||
    (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'APIUserAbortError')
  )
}

function toReadableError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    const detail =
      (err.error as { message?: string } | undefined)?.message ?? err.message
    if (err.status === 401) return `认证失败（401）：API Key 无效或已过期。${detail ?? ''}`
    if (err.status === 429) return `请求过于频繁或额度不足（429）。${detail ?? ''}`
    if (err.status && err.status >= 500) return `服务端错误（${err.status}）：${detail ?? ''}`
    return `请求失败（${err.status ?? '未知'}）：${detail ?? ''}`
  }
  if (err instanceof Error) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      return '网络错误：无法连接 DashScope，请检查网络连接。'
    }
    return err.message
  }
  return '未知错误，请重试。'
}
