import { isValidElement, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Check, Copy, Maximize2, X } from 'lucide-react'
import { copyText } from '../../utils/clipboard'
import { childrenToText, extractLanguage } from './utils'

interface PreProps {
  children?: ReactNode
}

/** 从 <pre> 的子 <code> 元素读取语言与原始代码文本 */
function readCode(children: ReactNode): { lang: string; code: string; codeEl: ReactNode } {
  let lang = ''
  const codeEl: ReactNode = children
  if (isValidElement(children)) {
    const props = children.props as { className?: string }
    lang = extractLanguage(props.className)
  }
  const code = childrenToText(children).replace(/\n$/, '')
  return { lang, code, codeEl }
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    if (await copyText(code)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      title="复制代码"
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">已复制</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>复制</span>
        </>
      )}
    </button>
  )
}

/** 覆写 react-markdown 的 <pre>：渲染为代码卡片（语言徽章 + 复制 + 全屏） */
export function CodeCard({ children }: PreProps) {
  const { lang, code, codeEl } = readCode(children)

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-gray-700 bg-[#0d1117]">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-[#161b22] px-3 py-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {lang || 'code'}
        </span>
        <div className="flex items-center gap-1">
          <CopyButton code={code} />
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                type="button"
                title="全屏查看"
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>全屏</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
              <Dialog.Content
                aria-describedby={undefined}
                className="fixed left-1/2 top-1/2 z-[91] flex max-h-[90vh] w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gray-700 bg-[#0d1117] shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-gray-700 bg-[#161b22] px-4 py-2">
                  <Dialog.Title className="text-sm font-medium uppercase tracking-wide text-gray-300">
                    {lang || 'code'}
                  </Dialog.Title>
                  <div className="flex items-center gap-1">
                    <CopyButton code={code} />
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        title="关闭 (Esc)"
                        className="flex items-center justify-center rounded p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
                <pre className="flex-1 overflow-auto">{codeEl}</pre>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      {/* 代码区（保留 rehype-highlight 的高亮节点） */}
      <pre className="overflow-auto">{codeEl}</pre>
    </div>
  )
}
