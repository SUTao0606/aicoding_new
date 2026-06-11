# 千问 App 开发阶段步骤书

**版本**: v1.0  
**日期**: 2026-06-11  
**依据**: requirements.md v1.0  
**部署目标**: 本地运行  
**约束**: 无登录系统 / API Key 服务端统一配置 / 历史会话以 JSON 文件持久化

---

## 整体架构决策

```
前端 (React + Vite)
    └── 直接调用 DashScope API（OpenAI 兼容模式）
         API Key 存储在 .env 本地文件，不提交 git
历史会话 → localStorage + 导出为 JSON 文件
```

> 纯前端应用，无后端服务，本地运行无安全风险。

---

## Phase 1 — 项目基建 + 基础 Chat

> **目标**: 跑通完整的一问一答流程，含流式输出和模型切换。

### Step 1.1 项目初始化

- [ ] 使用 Vite 创建 React + TypeScript 项目
  ```bash
  npm create vite@latest qwen-app -- --template react-ts
  cd qwen-app
  npm install
  ```
- [ ] 安装核心依赖
  ```bash
  npm install tailwindcss @tailwindcss/vite
  npm install zustand
  npm install openai          # DashScope OpenAI 兼容 SDK
  npm install react-markdown rehype-highlight rehype-raw remark-gfm
  npm install @radix-ui/react-select @radix-ui/react-dialog
  npm install lucide-react    # 图标库
  ```
- [ ] 配置 Tailwind CSS（`tailwind.config.ts` + `index.css`）
- [ ] 创建 `.env.local`，写入 `VITE_DASHSCOPE_API_KEY=sk-xxx`
- [ ] 配置 `.gitignore` 确保 `.env*` 不提交

**产出**: 可启动的空白页面，依赖安装完毕。

---

### Step 1.2 目录结构规划

```
src/
├── api/
│   └── chat.ts          # DashScope API 调用封装
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # 侧边栏（会话列表）
│   │   ├── TopBar.tsx        # 顶部栏（模型选择）
│   │   └── ChatArea.tsx      # 主对话区域
│   ├── chat/
│   │   ├── MessageBubble.tsx # 单条消息气泡
│   │   ├── MessageList.tsx   # 消息列表
│   │   └── InputBar.tsx      # 输入框区域
│   └── ui/                   # 通用 UI 组件
├── store/
│   ├── chatStore.ts     # 会话 & 消息状态
│   └── settingStore.ts  # 模型设置状态
├── types/
│   └── index.ts         # 全局类型定义
├── utils/
│   ├── storage.ts       # JSON 本地存储工具
│   └── clipboard.ts     # 剪贴板工具
└── App.tsx
```

**产出**: 目录骨架建立，各文件为空占位。

---

### Step 1.3 类型定义

在 `src/types/index.ts` 定义核心类型：

```typescript
// 消息角色
type Role = 'user' | 'assistant' | 'system'

// 单条消息（含多模态内容）
interface Message {
  id: string
  role: Role
  content: string | ContentPart[]  // 纯文本或多模态
  timestamp: number
  isStreaming?: boolean
}

// 多模态内容块
interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

// 会话
interface Conversation {
  id: string
  title: string
  model: ModelId
  messages: Message[]
  createdAt: number
  updatedAt: number
}

// 支持的模型
type ModelId = 
  | 'qwen-turbo'
  | 'qwen-plus'
  | 'qwen-max'
  | 'qwen-vl-plus'
  | 'qwen-vl-max'
  | 'qwen-long'
```

**产出**: 类型文件完成，后续所有模块基于此扩展。

---

### Step 1.4 状态管理（Zustand Store）

**`chatStore.ts`** 管理：
- `conversations: Conversation[]` — 所有会话列表
- `activeConversationId: string | null`
- actions: `createConversation` / `deleteConversation` / `selectConversation`
- actions: `addMessage` / `updateStreamingMessage` / `finalizeMessage`

**`settingStore.ts`** 管理：
- `currentModel: ModelId`（默认 `qwen-plus`）
- `temperature: number`（默认 0.7）
- action: `setModel` / `setTemperature`

**产出**: Store 完成，可在 DevTools 中观测状态变化。

---

### Step 1.5 API 封装（`src/api/chat.ts`）

```typescript
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  dangerouslyAllowBrowser: true,  // 本地开发可接受
})

// 流式对话，返回 AsyncIterable
export async function streamChat(
  messages: Message[],
  model: ModelId,
  onChunk: (delta: string) => void,
  signal?: AbortSignal,
): Promise<void>
```

- 封装 `AbortController` 支持停止生成
- 错误统一捕获，返回可读错误信息

**产出**: API 层完成，可用 `curl` 或单元测试验证连通性。

---

### Step 1.6 基础 UI 组件

按以下顺序实现，每个组件独立可测：

1. **`TopBar`**: Logo + 模型选择下拉（6 个模型）+ 主题切换开关
2. **`Sidebar`**: 会话列表 + 新建会话按钮 + 删除会话
3. **`MessageBubble`**: 用户/AI 气泡样式区分，时间戳，Markdown 渲染
4. **`MessageList`**: 滚动容器，新消息自动滚动到底部
5. **`InputBar`**: 多行文本框，Enter 发送 / Shift+Enter 换行，发送按钮，停止按钮

**产出**: 完整 UI 框架，支持手动输入发送和接收流式回复。

---

### Step 1.7 一键复制

- 每条 AI 消息气泡右上角悬浮显示复制图标
- 点击后调用 `navigator.clipboard.writeText()`
- 复制成功显示 1s 的 "已复制" 状态反馈

**产出**: Phase 1 全部完成，可进行端到端冒烟测试。

---

### Phase 1 验收标准

- [ ] 输入文字点击发送，收到流式输出
- [ ] 可切换模型，切换后新会话使用新模型
- [ ] Markdown 表格、代码块、加粗正确渲染
- [ ] 点击停止按钮，流式输出立即中断
- [ ] 点击重新生成，删除上一条 AI 回复并重新请求
- [ ] 一键复制 AI 消息成功

---

## Phase 2 — 多模态能力 + 图片分析卡片

> **目标**: 支持图片上传与图文混合发送，引入第一种卡片组件。

### Step 2.1 图片上传 UI

- `InputBar` 左侧增加回形针图标按钮
- 点击触发 `<input type="file" accept="image/*">`
- 支持拖拽图片到输入框区域
- 支持粘贴剪贴板图片（`paste` 事件监听）
- 上传后在输入框上方显示缩略图，右上角 × 可删除

**文件大小校验**: 超过 20MB 提示错误，阻止上传。

---

### Step 2.2 图片转 Base64 / URL

```typescript
// 本地图片 → base64 data URL
async function fileToBase64(file: File): Promise<string>

// 构建多模态 content 数组
function buildMultimodalContent(
  text: string,
  images: string[],   // base64 或 http URL
): ContentPart[]
```

---

### Step 2.3 视觉模型自动切换

- 当用户上传图片时，检测当前模型是否为 VL 模型
- 若非 VL 模型，弹出提示："当前模型不支持图片，已自动切换为 qwen-vl-plus"
- 用户也可手动选择 `qwen-vl-max` 获得更高质量

---

### Step 2.4 图片分析卡片组件

**`ImageAnalysisCard.tsx`**:
```
┌──────────────────────────────────────┐
│  [图片缩略图 160x120]  分析结果文字... │
│                        段落...       │
└──────────────────────────────────────┘
```

- 左侧固定展示发送的图片缩略图
- 右侧展示 AI 分析的 Markdown 文字
- 触发条件：消息 content 包含 `image_url` 类型

---

### Phase 2 验收标准

- [ ] 上传图片后缩略图正确显示
- [ ] 发送图文消息，AI 正确描述图片内容
- [ ] 粘贴图片 URL 发送成功
- [ ] 超大图片有明确错误提示
- [ ] 图片分析结果以卡片形式渲染

---

## Phase 3 — 结构化卡片渲染

> **目标**: 对 AI 回复进行解析，将常见结构渲染为视觉卡片。

### Step 3.1 卡片渲染引擎

设计统一的卡片识别策略（基于 Markdown AST 解析）：

| 卡片类型 | 识别规则 |
|----------|----------|
| 代码卡片 | 包含 ` ```lang ` 代码块 |
| 步骤卡片 | 包含连续有序列表（1. 2. 3.）且每项超过 15 字 |
| 对比卡片 | 包含 Markdown 表格，列数 ≥ 2 |

创建 `src/utils/cardParser.ts` 负责从消息内容中识别并提取卡片数据。

---

### Step 3.2 代码卡片

**`CodeCard.tsx`**:
- 顶部工具栏：语言徽章 + 复制按钮 + 全屏按钮
- 代码区域：`rehype-highlight` 语法高亮
- 全屏模式：Radix Dialog 实现，支持 ESC 关闭
- 暗色代码主题（`github-dark`）

---

### Step 3.3 步骤卡片

**`StepCard.tsx`**:
- 每个步骤一行：圆形数字序号 + 步骤文字
- 序号颜色跟随主题色
- 支持折叠（超过 5 步时默认折叠后 3 步）

---

### Step 3.4 对比卡片

**`CompareCard.tsx`**:
- 将 Markdown 表格渲染为带样式的 HTML 表格
- 首行（表头）加粗 + 背景色区分
- 奇偶行斑马纹，提升可读性

---

### Phase 3 验收标准

- [ ] 要求 AI 写代码，收到代码卡片而非纯文本
- [ ] 复制按钮正确复制代码内容
- [ ] 代码卡片全屏模式可正常打开和关闭
- [ ] 要求 AI 列出步骤，收到步骤卡片
- [ ] 要求 AI 做表格对比，收到对比卡片

---

## Phase 4 — 会话持久化 + 历史管理

> **目标**: 会话历史保存在本地，刷新页面后不丢失。

### Step 4.1 localStorage 持久化

```typescript
// src/utils/storage.ts

const STORAGE_KEY = 'qwen_conversations'

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

export function loadConversations(): Conversation[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}
```

- Zustand Store 订阅变化，每次 state 更新自动调用 `saveConversations`
- 应用启动时从 localStorage 加载，恢复上次状态

---

### Step 4.2 会话标题自动生成

- 新会话发送第一条消息后，取用户消息前 20 字作为会话标题
- 或通过一次非流式 API 请求让模型生成摘要标题（可选，成本低）

---

### Step 4.3 会话管理交互

侧边栏增强：
- 悬停会话条目显示编辑/删除图标
- 双击标题可内联编辑重命名
- 删除时弹出二次确认对话框
- 支持按创建时间倒序排列

---

### Step 4.4 JSON 导出 / 导入

- 侧边栏底部增加"导出全部会话"按钮
- 点击生成 `qwen_history_YYYYMMDD.json` 文件下载
- 支持拖拽或选择 JSON 文件导入历史（合并而非覆盖）

---

### Phase 4 验收标准

- [ ] 新建会话、发送消息、刷新页面，历史完整保留
- [ ] 会话标题自动设置为首条消息内容
- [ ] 可重命名、删除会话
- [ ] 导出 JSON 文件内容结构正确，可重新导入

---

## Phase 5 — 主题切换 + 移动端适配

> **目标**: 支持亮/暗主题，在移动设备上可用。

### Step 5.1 主题系统

- 使用 Tailwind CSS `dark:` 变体
- 主题状态存入 `settingStore` 并持久化到 localStorage
- 顶部栏 Toggle 按钮切换，图标 ☀️ / 🌙
- 初始化时读取 `prefers-color-scheme` 跟随系统

---

### Step 5.2 移动端布局适配

| 变化点 | 桌面端 | 移动端（< 768px）|
|--------|--------|-----------------|
| 侧边栏 | 固定展示（240px）| 默认隐藏，汉堡菜单触发抽屉 |
| 输入框 | 固定底部 | 键盘弹出时保持可见 |
| 卡片 | 最大宽度限制 | 全宽展示 |
| 代码卡片全屏 | Dialog | 全屏覆盖 |

---

### Step 5.3 细节打磨

- [ ] 页面 `<title>` 跟随当前会话名称
- [ ] 无会话时展示欢迎引导页（推荐提示词）
- [ ] 消息发送时输入框禁用，防止重复提交
- [ ] 长文本消息折叠（超过 10 行显示"展开"按钮）
- [ ] 键盘快捷键：`Ctrl+N` 新建会话，`Ctrl+/` 聚焦输入框

---

### Phase 5 验收标准

- [ ] 切换主题后全局样式正确变更
- [ ] 刷新后主题设置保留
- [ ] 移动端（375px）侧边栏抽屉正常开合
- [ ] 移动端键盘弹出时输入框不被遮挡

---

## 开发进度总览

| Phase | 主要内容 | 优先级 | 估算工作量 |
|-------|----------|--------|-----------|
| Phase 1 | 项目基建 + 基础 Chat + 流式输出 + 模型切换 + 复制 | P0 | 3-4 天 |
| Phase 2 | 多模态图片上传 + 图片分析卡片 | P0 | 2 天 |
| Phase 3 | 代码卡片 + 步骤卡片 + 对比卡片 | P1 | 2 天 |
| Phase 4 | localStorage 持久化 + 会话管理 + JSON 导出 | P1 | 1-2 天 |
| Phase 5 | 暗色主题 + 移动端适配 + 细节打磨 | P2 | 2 天 |

---

## 关键注意事项

1. **API Key 安全**: 本地运行使用 `.env.local`，将 `.env*` 加入 `.gitignore`
2. **图片大小**: Base64 编码大图会使 localStorage 超限（5MB），考虑只存图片 URL 或 IndexedDB
3. **VL 模型兼容**: `qwen-vl-*` 的 content 格式为数组，文本模型为字符串，API 层需区分处理
4. **流式中断**: `AbortController` 中断后需清理 `isStreaming` 状态，避免 UI 卡在加载态
5. **Markdown 安全**: 使用 `rehype-sanitize` 防止 XSS（AI 回复中可能含 HTML）
