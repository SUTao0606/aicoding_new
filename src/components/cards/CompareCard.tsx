import type { ReactNode } from 'react'

interface TableProps {
  children?: ReactNode
}

/**
 * 覆写 react-markdown 的 <table>：渲染为对比卡片。
 * 表头底色 + 斑马纹由 index.css 的 .markdown-body 规则提供，
 * 这里负责圆角边框容器 + 横向滚动外壳。
 */
export function CompareCard({ children }: TableProps) {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      <table style={{ margin: 0 }} className="w-full min-w-[420px] border-collapse">
        {children}
      </table>
    </div>
  )
}
