# 千问 Chat

> 基于阿里云通义千问（Qwen）系列模型的纯前端 AI 对话应用。
> 支持多轮对话、流式输出、多模态图文输入、结构化卡片渲染、会话持久化、亮/暗主题与移动端适配。

技术栈：**React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Zustand**

> 📖 项目架构与实现细节见 [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)。

---

## ✨ 功能特性

- 💬 **多轮对话** — 流式逐字输出，可随时停止 / 重新生成
- 🖼️ **多模态** — 上传 / 拖拽 / 粘贴图片，自动切换视觉模型
- 🎴 **结构化卡片** — 代码卡片（高亮 + 复制 + 全屏）、步骤卡片、对比表格、图片分析
- 🔄 **模型切换** — 6 个 Qwen 模型自由切换
- 💾 **会话持久化** — 历史存于浏览器，支持 JSON 导出 / 导入
- 🌓 **亮 / 暗主题** — 跟随系统偏好，刷新不丢失
- 📱 **响应式** — 桌面端固定侧边栏，移动端抽屉菜单

---

## 📋 环境要求

| 依赖 | 版本 |
|------|------|
| [Node.js](https://nodejs.org/) | **18 或更高** |
| npm | 随 Node.js 自带（或使用 pnpm / yarn） |
| 通义千问 API Key | 必需，见下方获取方式 |

---

## 🔑 获取 API Key

本项目使用阿里云 **DashScope（百炼）** 的 OpenAI 兼容接口：

1. 登录 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 开通服务后，在 **API-KEY** 页面创建一个密钥
3. 复制以 `sk-` 开头的密钥备用

> 新用户通常有免费额度，足够本地体验。

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd aicoding_new
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

在项目根目录创建 `.env` 文件（可复制 `.env.example` 模板）：

```bash
# Windows (PowerShell / Git Bash)
cp .env.example .env

# macOS / Linux
cp .env.example .env
```

然后编辑 `.env`，填入你的密钥：

```bash
VITE_DASHSCOPE_API_KEY=sk-你的真实密钥
```

> ⚠️ `.env` 已被 `.gitignore` 排除，**不会**被提交到 Git，请放心填写。

### 4. 启动开发服务器

```bash
npm run dev
```

终端会输出本地地址，浏览器打开即可：

```
➜  Local:   http://localhost:5173/
```

---

## 📦 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器（带热更新） |
| `npm run build` | 类型检查 + 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览生产构建产物 |
| `npm run lint` | 运行 ESLint 代码检查 |

---

## ⌨️ 快捷键

| 操作 | 说明 |
|------|------|
| `Enter` | 发送消息 |
| `Shift + Enter` | 输入框内换行 |
| `Ctrl / ⌘ + N` | 新建会话 |
| `Ctrl / ⌘ + /` | 聚焦输入框 |
| 双击会话标题 | 重命名 |

---

## ❓ 常见问题

**Q：提示「未配置 API Key」怎么办？**
确认根目录存在 `.env` 且变量名为 `VITE_DASHSCOPE_API_KEY`。修改 `.env` 后需**重启 dev server** 才能生效。

**Q：发消息报 401 / 认证失败？**
API Key 无效或已过期，请到百炼控制台重新确认密钥。

**Q：刷新后历史里的图片不见了？**
属于预期行为。为避免撑爆浏览器本地存储，图片不做持久化，刷新后历史中的图片会显示为 `[图片]` 占位，文字与对话结构保留。

**Q：能部署到公网吗？**
本项目为纯前端直连，API Key 会暴露在浏览器，**仅适合本地运行**。如需公网部署，请改为后端代理转发请求、隐藏密钥。

---

## ⚠️ 安全提示

- 切勿将 `.env` 或真实 API Key 提交到任何公开仓库。
- 本项目默认 `dangerouslyAllowBrowser: true`（浏览器直连），仅用于本地开发，不适合生产环境直接对外暴露。

---

## 📄 相关文档

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — 项目架构、目录结构与实现要点
- [requirements.md](requirements.md) — 原始需求文档
- [development-plan.md](development-plan.md) — 分阶段开发计划
