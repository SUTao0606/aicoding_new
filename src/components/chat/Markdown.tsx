import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { CodeCard } from '../cards/CodeCard'
import { CompareCard } from '../cards/CompareCard'
import { StepCard } from '../cards/StepCard'

// 结构化卡片：覆写对应 Markdown 元素的渲染
const components: Components = {
  pre: CodeCard,
  table: CompareCard,
  ol: StepCard,
}

/** 统一的 Markdown 渲染（assistant 正文 / 卡片共用），含结构化卡片识别 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  )
}
