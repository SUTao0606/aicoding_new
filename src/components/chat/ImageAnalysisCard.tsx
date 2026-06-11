import { useState } from 'react'
import { Check, Copy, ImageIcon, RotateCcw } from 'lucide-react'
import type { Message } from '../../types'
import { messageImages, messageText } from '../../types'
import { copyText } from '../../utils/clipboard'
import { Markdown } from './Markdown'

interface Props {
  userMessage: Message
  assistantMessage: Message
  canRegenerate: boolean
  onRegenerate: () => void
}

/** 图片分析卡片：左侧发送的图片缩略图，右侧 AI 的 Markdown 分析文字 */
export function ImageAnalysisCard({
  userMessage,
  assistantMessage,
  canRegenerate,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false)
  const images = messageImages(userMessage.content)
  const prompt = messageText(userMessage.content)
  const analysis = messageText(assistantMessage.content)
  const streaming = assistantMessage.isStreaming

  const handleCopy = async () => {
    if (await copyText(analysis)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
        <ImageIcon className="h-3.5 w-3.5" />
        图片分析
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        {/* 左：缩略图 */}
        <div className="flex shrink-0 flex-col gap-2">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`分析图片 ${i + 1}`}
              className="h-[120px] w-[160px] rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          ))}
        </div>

        {/* 右：提问 + 分析 */}
        <div className="min-w-0 flex-1">
          {prompt && (
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">{prompt}</p>
          )}
          <div
            className={`markdown-body text-gray-800 dark:text-gray-100 ${
              streaming ? 'streaming-cursor' : ''
            } ${
              assistantMessage.error
                ? 'rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                : ''
            }`}
          >
            <Markdown>{analysis}</Markdown>
          </div>

          {!streaming && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <button
                type="button"
                onClick={handleCopy}
                title="复制分析"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
              {canRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  title="重新生成"
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
