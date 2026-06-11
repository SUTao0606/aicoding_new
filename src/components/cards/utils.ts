import { Children, isValidElement, type ReactNode } from 'react'

/** 递归把 React children 提取为纯文本（用于长度判断 / 复制） */
export function childrenToText(node: ReactNode): string {
  if (node == null || node === false || node === true) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(childrenToText).join('')
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode }
    return childrenToText(props.children)
  }
  return ''
}

/** 从 code 元素的 className 中提取语言标识（language-xxx） */
export function extractLanguage(className?: string): string {
  if (!className) return ''
  const match = /language-([\w-]+)/.exec(className)
  return match ? match[1] : ''
}

/** 取出有序列表的顶层 li 子元素（过滤掉空白文本节点） */
export function getListItems(children: ReactNode): ReactNode[] {
  return Children.toArray(children).filter((c) => isValidElement(c) && c.type === 'li')
}
