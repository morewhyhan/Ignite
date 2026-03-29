# Ignite

> 适合比赛项目的快速迭代开发模板 - 轻量、高可定制化

**项目名称寓意**：Ignite 点燃项目创意，像 Flame 一样快速启动。专为比赛场景设计，让你在有限时间内快速搭建原型，专注于核心功能的实现。

---

## 📖 新手友好

**新手也能快速上手！**

本项目为新手开发者精心编写了详细的开发指南，即使你只有基础的编程知识，也能快速开发出功能完善的应用。

- ✅ **手把手教程** - 从零开始的完整开发流程
- ✅ **代码注释详细** - 每行代码都有中文注释
- ✅ **复制即用** - 提供大量可直接复制的代码模板
- ✅ **图文并茂** - 数据流动图、架构图直观展示
- ✅ **AI 辅助** - 配合 Claude/GPT 等工具高效开发

**必读文档**：
- 📘 [开发指南.md](./docs/开发指南.md) - 新手必读，手把手教你开发
- 📗 [开发技术规范.md](./docs/开发技术规范.md) - AI 辅助开发时参考

---

## ✨ 特性

- **🚀 快速开发** - 开箱即用，专注于业务逻辑
- **📦 完整功能** - 用户认证、数据库、API 路由、UI 组件
- **🎨 高度可定制** - 轻松修改样式、添加功能
- **🔒 用户隔离** - 每个用户的数据完全隔离
- **📝 文档齐全** - 开发指南 + 技术规范

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.5 | React 框架 |
| Hono | 4.6.2 | 后端 API |
| React Query | 5.56.2 | 数据管理 |
| Prisma | 6.19.2 | 数据库 ORM |
| shadcn/ui | - | UI 组件库 |
| Tailwind CSS | 4.2.2 | 样式框架 |
| Better Auth | - | 用户认证 |

---

## 🎯 适用场景

- 🏆 **编程比赛** - 快速搭建原型，专注于核心功能
- 🎓 **课程项目** - 完整的项目结构，易于理解和扩展
- 💼 **黑客松** - 轻量模板，快速迭代
- 🌱 **个人项目** - 学习全栈开发，最佳实践

---

## 📦 快速开始

```bash
git clone https://github.com/morewhyhan/Ignite.git
cd Ignite
pnpm install
pnpm prisma migrate dev
pnpm dev
```

访问 `http://localhost:3000`

---

## 📂 项目结构

```
Ignite/
├── app/                    # 前端页面
│   ├── page.tsx           # 首页
│   └── dashboard/         # 后台页面
├── components/            # 可复用组件
├── hooks/                 # 自定义 Hook
├── lib/                   # 工具库
├── prisma/               # 数据库配置
├── server/               # 后端 API
└── docs/                 # 文档
    ├── 开发指南.md       # 用户必读
    ├── 开发技术规范.md   # AI 辅助开发参考
    └── guides/          # 技术入门指南
```

---

## 🚀 添加新功能

**必读文档：[开发指南.md](./docs/开发指南.md)**

以 4 步快速添加新功能：

```
1️⃣ 定义数据库表 (prisma/schema.prisma)
   ↓
2️⃣ 编写后端 API (server/api/routes/)
   ↓
3️⃣ 封装业务逻辑 (hooks/use-xxx.ts)
   ↓
4️⃣ 编写前端页面 (app/xxx/page.tsx)
```

---

## 📚 文档

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [开发指南.md](./docs/开发指南.md) | 完整的开发流程教程 | **开发者必读** |
| [开发技术规范.md](./docs/开发技术规范.md) | 技术规范和最佳实践 | AI 辅助开发参考 |
| [Prisma 入门](./docs/guides/01-prisma.md) | 数据库操作详解 | 深入学习 |
| [Hono 入门](./docs/guides/02-hono.md) | 后端 API 开发 | 深入学习 |
| [React Query 入门](./docs/guides/03-react-query.md) | 前端数据管理 | 深入学习 |
| [Next.js 入门](./docs/guides/04-nextjs.md) | 前端页面开发 | 深入学习 |
| [shadcn/ui 入门](./docs/guides/05-shadcn-ui.md) | UI 组件使用 | 深入学习 |

---

## 🎨 内置功能

### ✅ 已实现

- **用户认证** - 邮箱注册/登录
- **用户会话** - 自动管理登录状态
- **任务管理** - 完整的 CRUD 示例
- **设置页面** - 用户信息展示、退出登录
- **响应式 UI** - 适配各种屏幕尺寸
- **深色模式** - 主题切换支持

### 🔧 待扩展

项目模板已搭好基础，你可以快速添加：

- 数据可视化
- 文件上传
- 实时通信
- 支付集成
- 任何你需要的功能

---

## 🤖 AI 辅助开发

推荐使用 AI (Claude/GPT) 辅助开发时，提供以下上下文：

```
请严格按照《开发技术规范.md》中的规范开发。
项目使用 Next.js + Hono + React Query + Prisma + shadcn/ui。
参考 hooks/use-tasks.ts 和 app/dashboard/tasks/page.tsx 的实现方式。
```

---

## 📝 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 数据库
pnpm prisma studio    # 可视化数据库管理
pnpm prisma migrate dev    # 创建数据库迁移
pnpm prisma migrate reset  # 重置数据库

# 代码质量
pnpm lint             # 代码检查
pnpm type-check       # 类型检查
```

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  Pages (app/)  →  Hooks (hooks/)  →  API Client (lib/) │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      后端 (Hono)                        │
├─────────────────────────────────────────────────────────┤
│  Routes (server/api/routes/)  →  Prisma (lib/db.ts)    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     数据库 (SQLite)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 设计原则

1. **简单优先** - 避免过度设计
2. **快速迭代** - 减少配置，专注功能
3. **类型安全** - TypeScript 全覆盖
4. **用户隔离** - 数据安全隔离
5. **易于扩展** - 模块化设计

---

## 📦 部署

### Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Hono](https://hono.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)

---

**快速开始开发 → 阅读 [开发指南.md](./docs/开发指南.md)**
