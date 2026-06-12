# 千问 Chat — 项目总览

> 基于阿里云通义千问（Qwen）系列模型的纯前端 AI 对话应用。
> 支持多轮对话、流式输出、多模态图文输入、结构化卡片渲染、会话持久化、亮/暗主题与移动端适配。

**版本**: v1.0 ｜ **更新日期**: 2026-06-11 ｜ **部署目标**: 本地运行

---

## 1. 项目简介

千问 Chat 是一个**无后端、纯前端**的 AI 聊天应用。前端直接调用 DashScope 的 OpenAI 兼容接口，API Key 通过本地 `.env` 注入，会话历史以 `localStorage` + JSON 文件的形式持久化。

整个项目按 5 个 Phase 迭代完成，当前 5 个 Phase 全部交付。

| 特性 | 说明 |
|------|------|
| 💬 多轮对话 | 维护完整上下文，流式逐字输出，可停止 / 重新生成 |
| 🖼️ 多模态 | 上传 / 拖拽 / 粘贴图片，自动切换 VL 视觉模型，图文混合提问 |
| 🎴 结构化卡片 | 代码卡片（高亮 + 复制 + 全屏）、步骤卡片、对比表格卡片、图片分析卡片 |
| 🔄 模型切换 | 6 个 Qwen 模型自由切换，VL 模型按需自动切换 |
| 💾 持久化 | 会话存 localStorage，支持 JSON 导出 / 导入合并 |
| 🌓 主题 | 亮 / 暗主题切换，跟随系统偏好，刷新不丢失、不闪烁 |
| 📱 响应式 | 桌面端固定侧边栏，移动端汉堡菜单 + 抽屉 |

---

## 2. 技术栈

| 层次 | 选型 | 说明 |
|------|------|------|
| 框架 | **React 19 + TypeScript** | 函数组件 + Hooks |
| 构建 | **Vite 8** | 极速启动与 HMR |
| 样式 | **Tailwind CSS v4** | `@tailwindcss/vite` 插件，`class` 策略暗色变体 |
| 状态 | **Zustand 5** | 轻量全局状态，`persist` 中间件做持久化 |
| AI SDK | **openai (v6)** | 指向 DashScope 兼容端点，浏览器直连 |
| Markdown | **react-markdown** | `remark-gfm` + `rehype-highlight` + `rehype-raw` + `rehype-sanitize` |
| UI 基元 | **@radix-ui** | `react-select`（模型下拉）、`react-dialog`（全屏 / 抽屉 / 确认框） |
| 图标 | **lucide-react** | — |

---

## 3. 整体架构

```
浏览器（纯前端 SPA）
  │
  ├── React 组件树（布局 / 聊天 / 卡片 / UI）
  │
  ├── Zustand Stores（chat / setting / toast）
  │     └── persist → localStorage（会话历史 + 设置）
  │
  └── api/chat.ts（openai SDK）
        └── HTTPS 直连 ──► DashScope（OpenAI 兼容模式）
              https://dashscope.aliyuncs.com/compatible-mode/v1
```

> **无后端服务**：本地运行，`dangerouslyAllowBrowser: true` 直连。API Key 存于 `.env` 且被 `.gitignore` 排除，不入库。

---

## 4. 目录结构

```
src/
├── api/
│   └── chat.ts                # DashScope 流式调用封装 + 可读错误映射
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # 会话列表（桌面内联 / 移动抽屉）+ 导出导入
│   │   ├── TopBar.tsx         # Logo + 模型下拉 + 主题切换 + 汉堡菜单
│   │   └── ChatArea.tsx       # 主区域：欢迎页 / 消息列表 / 输入框
│   ├── chat/
│   │   ├── MessageList.tsx    # 滚动容器 + 图片分析卡片合并渲染
│   │   ├── MessageBubble.tsx  # 用户 / AI 气泡，复制 / 重新生成 / 长文折叠
│   │   ├── ImageAnalysisCard.tsx  # 图文并排分析卡片
│   │   ├── InputBar.tsx       # 多行输入 + 图片上传 / 拖拽 / 粘贴
│   │   └── Markdown.tsx       # 统一 Markdown 渲染 + 卡片元素覆写
│   ├── cards/
│   │   ├── CodeCard.tsx       # 代码卡片（语言徽章 + 复制 + 全屏 Dialog）
│   │   ├── StepCard.tsx       # 步骤卡片（序号 + 折叠）
│   │   ├── CompareCard.tsx    # 对比表格卡片（边框 + 横向滚动）
│   │   └── utils.ts           # AST 文本提取 / 语言识别等
│   └── ui/
│       └── Toaster.tsx        # 全局轻提示
├── hooks/
│   ├── useChat.ts             # 发送 / 停止 / 重新生成 编排逻辑
│   └── useTheme.ts            # 同步 theme → <html class="dark">
├── store/
│   ├── chatStore.ts           # 会话 & 消息状态（持久化，剔除 base64 图片）
│   ├── settingStore.ts        # 当前模型 / temperature / 主题（持久化）
│   └── toastStore.ts          # 轻提示队列
├── types/
│   └── index.ts               # 全局类型 + 模型清单 + 内容辅助函数
├── utils/
│   ├── storage.ts             # 导出 / 导入 / 图片剔除
│   ├── image.ts               # 图片校验 + base64 + 多模态 content 构建
│   └── clipboard.ts           # 剪贴板封装
└── App.tsx                    # 根组件：布局 + 标题同步 + 全局快捷键
```

---

## 5. 核心数据模型

```ts
// 一条消息：content 为纯文本或多模态数组
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string | ContentPart[]      // 多模态时为 text / image_url 块数组
  timestamp: number
  isStreaming?: boolean                // 流式占位标记
  error?: boolean                      // 请求失败的错误文案标记
}

// 一个会话
interface Conversation {
  id: string
  title: string                        // 首条用户消息前 20 字自动生成
  model: ModelId
  messages: Message[]
  createdAt: number
  updatedAt: number
}
```

**支持模型**：`qwen-turbo` / `qwen-plus`（默认） / `qwen-max` / `qwen-vl-plus` / `qwen-vl-max` / `qwen-long`。
`qwen-vl-*` 为视觉模型，`isVisionModel()` 据前缀判断，上传图片时自动切换为 `qwen-vl-plus`。

---

## 6. 关键实现要点

### 流式对话（`api/chat.ts` + `hooks/useChat.ts`）
- `streamChat()` 以 `stream: true` 创建请求，逐 chunk 回调 `onChunk(delta)`，由 store 增量拼接。
- 通过 `AbortController` 支持「停止生成」；中断时保留已生成内容，仅清理 `isStreaming`。
- 错误统一映射为可读中文（401 / 429 / 5xx / 网络错误），失败消息以红色错误气泡呈现。

### 结构化卡片（`components/chat/Markdown.tsx` + `components/cards/`）
- 不做额外的文本解析，而是**覆写 react-markdown 的元素渲染**：
  `pre → CodeCard`、`table → CompareCard`、`ol → StepCard`。
- `StepCard` 内部判断「多项且每项足够长」才渲染为步骤卡片，否则回退为普通有序列表。
- `CodeCard` 用 Radix Dialog 实现全屏查看（ESC 关闭），代码区始终暗色主题（`github-dark`）。
- 含图片的用户消息 + 紧随的 AI 回复，会在 `MessageList` 中合并为 `ImageAnalysisCard`（左图右文）。

### 持久化（`store/*` + `utils/storage.ts`）
- Zustand `persist` 自动读写 localStorage：
  - 会话历史 → `qwen_conversations`
  - 设置（主题 / 当前模型）→ `qwen_settings`
- **base64 大图会撑爆 localStorage（~5MB）**：持久化前用 `stripImages()` 把图片块替换为 `[图片]` 占位，保留文字与结构；`QuotaExceededError` 有兜底提示。
- 导出生成 `qwen_history_YYYYMMDD.json`；导入按 `id` 去重**合并**（非覆盖）。

### 主题 & 防闪烁（`index.html` + `hooks/useTheme.ts`）
- 暗色采用 Tailwind `class` 策略（`<html class="dark">`）。
- `index.html` 内联脚本在渲染前读取持久化主题 / 系统偏好并提前加 class，**避免首屏白闪**。
- `useTheme()` 订阅 store，运行时同步 class。

### 响应式（`< 768px`）
- 桌面：侧边栏 `md:flex` 固定 240px 内联展示。
- 移动：侧边栏隐藏，TopBar 出现汉堡菜单，点击以 Radix Dialog 抽屉滑出；选择 / 新建会话后自动关闭。

---

## 7. 开发阶段回顾

| Phase | 内容 | 状态 |
|-------|------|------|
| **Phase 1** | 项目基建 + 基础 Chat + 流式输出 + 模型切换 + 一键复制 | ✅ |
| **Phase 2** | 多模态图片上传（上传/拖拽/粘贴）+ VL 自动切换 + 图片分析卡片 | ✅ |
| **Phase 3** | 代码卡片 + 步骤卡片 + 对比卡片 | ✅ |
| **Phase 4** | localStorage 持久化 + 会话重命名/删除 + JSON 导出/导入 | ✅ |
| **Phase 5** | 亮/暗主题 + 移动端适配 + 长文折叠 + 快捷键等细节打磨 | ✅ |

> 详细步骤见 [development-plan.md](development-plan.md)，原始需求见 [requirements.md](requirements.md)。

---

## 8. 快速开始

### 环境要求
- Node.js（建议 18+）
- 一个 DashScope（通义千问）API Key

### 配置
在项目根目录创建 `.env`：

```bash
VITE_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
```

> `.env*` 已在 `.gitignore` 中，不会提交。修改后需**重启 dev server** 生效。

### 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
npm run build      # 类型检查 + 生产构建（输出到 dist/）
npm run preview    # 本地预览生产构建
npm run lint       # ESLint 检查
```

---

## 9. 快捷键与交互

| 操作 | 说明 |
|------|------|
| `Enter` | 发送消息 |
| `Shift + Enter` | 输入框内换行 |
| `Ctrl / ⌘ + N` | 新建会话 |
| `Ctrl / ⌘ + /` | 聚焦输入框 |
| 双击会话标题 | 内联重命名 |
| AI 气泡悬停 | 显示「复制」/「重新生成」 |
| 主题按钮（☀️/🌙） | 切换亮 / 暗色 |

---

## 10. 已知约束与注意事项

1. **API Key 暴露在前端**：仅适合**本地运行**。如需公网部署，必须改为后端代理转发，移除 `dangerouslyAllowBrowser`。
2. **图片不持久化**：base64 图片仅在当前会话内存中可见，刷新后历史里的图片会变为 `[图片]` 占位（防止 localStorage 超限）。
3. **模型格式差异**：VL 模型 content 为数组、文本模型为字符串，API 层 `toApiMessage()` 已做区分。
4. **XSS 防护**：AI 回复可能含 HTML，渲染链路启用了 `rehype-sanitize`。
5. **构建告警**：单 chunk 体积 > 500KB 的提示属预期（未做代码分割），不影响功能。
