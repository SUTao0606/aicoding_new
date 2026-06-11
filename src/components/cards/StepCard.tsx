import { isValidElement, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { childrenToText, getListItems } from './utils'

interface OlProps {
  children?: ReactNode
  start?: number
}

const STEP_MIN_LEN = 10 // 每项平均长度达到此值才视作步骤卡片（中文信息密度高，10 字已是完整步骤）
const COLLAPSE_AFTER = 5 // 步数超过此值时默认折叠

/** 取 li 的内容子节点（react-markdown 的 li children 可能包着 <p>，直接透传即可） */
function liContent(li: ReactNode): ReactNode {
  if (isValidElement(li)) {
    return (li.props as { children?: ReactNode }).children
  }
  return li
}

/**
 * 覆写 react-markdown 的 <ol>：
 * 若是「多项且每项较长」的有序列表 → 渲染为步骤卡片；否则回退为普通有序列表。
 */
export function StepCard({ children, start }: OlProps) {
  const items = getListItems(children)
  const texts = items.map((li) => childrenToText(li).trim())
  const avgLen = texts.length ? texts.reduce((s, t) => s + t.length, 0) / texts.length : 0
  const isSteps = items.length >= 2 && avgLen >= STEP_MIN_LEN

  const [expanded, setExpanded] = useState(false)

  // 不满足步骤特征 → 普通有序列表
  if (!isSteps) {
    return (
      <ol className="my-2 list-decimal pl-6" start={start}>
        {children}
      </ol>
    )
  }

  const collapsible = items.length > COLLAPSE_AFTER
  const visible = collapsible && !expanded ? items.slice(0, COLLAPSE_AFTER) : items
  const baseStart = start ?? 1

  return (
    <div className="my-3 flex flex-col gap-2">
      {visible.map((li, i) => (
        <div key={i} className="flex items-start gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: 'var(--qwen-primary)' }}
          >
            {baseStart + i}
          </span>
          <div className="markdown-body min-w-0 flex-1 pt-0.5">{liContent(li)}</div>
        </div>
      ))}

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-9 flex w-fit items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? '收起' : `展开全部 ${items.length} 步`}
        </button>
      )}
    </div>
  )
}
