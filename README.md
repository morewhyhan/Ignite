<div align="center">
  <h1>Ignite</h1>
  <p><strong>从一个问题开始，快速做出产品，并且继续做下去。</strong></p>
  <p>一套面向 AI 协作的全栈模板，帮你把想法做成能用、能验证、能继续改的产品。</p>
  <p>
    <a href="https://github.com/morewhyhan/Ignite/generate">Use this template</a>
    ·
    <a href="#核心功能">查看核心功能</a>
    ·
    <a href="#ai-开发-loop">了解 AI 开发 Loop</a>
  </p>
</div>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-149eca?logo=react" alt="React 19"></a>
  <a href="https://hono.dev/"><img src="https://img.shields.io/badge/Hono-4-e36002?logo=hono" alt="Hono 4"></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma" alt="Prisma 6"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript 5"></a>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#核心功能">核心功能</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#为什么选择-ignite">为什么选择 Ignite</a> ·
  <a href="#ai-开发-loop">AI 开发 Loop</a> ·
  <a href="#文档导航">文档导航</a>
</p>

---

## 快速开始

基于模板创建 GitHub 仓库后，在 WSL/Linux 的项目根目录运行：

```bash
nvm install "$(tr -d '\r\n' < .node-version)"
nvm use "$(tr -d '\r\n' < .node-version)"
corepack enable
node scripts/runtime-doctor.mjs --preflight
cp .env.example .env
pnpm install --frozen-lockfile
pnpm runtime:check
pnpm db:setup
pnpm dev
```

打开 [localhost:3000](http://localhost:3000)，注册后即可体验工作台和 Tasks 示例。默认使用本地 SQLite，无需配置真实邮箱服务。

首次采用时，按[模板采用指南](./docs/standards/adoption.md)更换项目名称与密钥，设置自己的 Git 仓库，并决定如何处理 Tasks 示例。Windows 与 WSL 的依赖需分别安装，不能共用 `node_modules`。

<details>
  <summary>给 AI 的第一条任务，可以这样写</summary>

```text
先阅读 AGENTS.md 和模板采用指南。
我想做一个自用的读书笔记网站，第一轮需要新增、编辑、删除笔记，并按书名筛选。
请检查现有能力，列清本轮范围和验收标准，再按项目工作流实现、测试并回写文档。
完成后告诉我如何使用、验证了什么，以及还有哪些未完成项。
```

</details>

## 核心功能

| 开箱即用       | 可以直接做什么                                                          |
| -------------- | ----------------------------------------------------------------------- |
| 网站基础       | 使用首页、注册登录、工作台、账户设置和响应式页面。                      |
| 完整业务示例   | 参照 Tasks 的新增、编辑、完成、删除与用户数据隔离，开发自己的业务模块。 |
| AI 开发流程    | 让 AI 按需求和验收标准制定计划、编写测试、实现并检查。                  |
| 可接续的上下文 | 从文档查当前设计、已做决定和未完成任务，换会话后继续推进。              |
| 可检查的结果   | 用自动化测试、迁移和浏览器检查核对交付，并查看验证记录。                |
| 按需扩展       | 替换品牌与示例业务，沿清晰的模块边界添加功能。                          |

当前基线是 Web 应用。支付、真实邮件、文件存储和其他平台的客户端，按项目需要再接入；模板为后续选择留出空间。

功能详情：[产品基线](./docs/features/product.md) · [认证](./docs/features/auth.md) · [Tasks](./docs/features/tasks.md)。

## 技术栈

| 应用层     | 基础技术                                                         |
| ---------- | ---------------------------------------------------------------- |
| 页面与界面 | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Radix UI |
| 业务请求   | TanStack Query 5 · Hono Typed RPC · Zod 4                        |
| 账户与数据 | Better Auth · Prisma 6 · SQLite（本地默认）                      |
| 开发与验证 | Vitest · Playwright · ESLint · Prettier                          |

**架构：模块化单体。** 页面组合业务模块，业务数据沿 Hook → Typed RPC → Hono → Prisma 流转，认证由 Better Auth 处理。

<p align="center">
  <img src="./docs/assets/ignite-architecture.svg" width="680" alt="Ignite 模块化单体架构">
</p>

正式部署需要 HTTPS、独立密钥和持久化生产数据库；运行时版本以 [`.node-version`](./.node-version) 与 [`package.json`](./package.json) 为准。深入了解：[架构](./docs/standards/architecture.md) · [API](./docs/standards/api.md) · [数据库](./docs/standards/database.md)。

## 为什么选择 Ignite

> **更早开始。更快验证。第一版之后，仍然改得动。**

你把精力放在用户、问题和产品取舍上。AI 按仓库约定承担更多实现工作；需求、测试和当前设计则帮你留住上下文、核对结果。适合借助 AI 做个人工具、验证产品想法，也适合在真实开发中边做边学。

## AI 开发 Loop

`Feature → Plan → Contract / Test → Implementation → Verify → Design`

<p align="center">
  <img src="./docs/assets/ignite-ai-loop.svg" width="760" alt="Ignite AI 开发 Loop">
</p>

先说清用户目标、范围与验收标准，再让 AI 逐步实现。测试和检查通过后记录验证结果、更新当前设计；失败就修复后重验，遇到权限或外部条件问题则明确记录阻塞。

项目规则由 [`AGENTS.md`](./AGENTS.md) 统一维护，供 Codex、Claude Code、Cursor、OpenCode 和 GitHub Copilot 等工具引用。开始新一轮时，可用 `pnpm ignite status` 看状态，用 `pnpm ignite next --plan <IGT-ID>` 接续计划。详情见[开发工作流](./docs/standards/workflow.md)和[测试规范](./docs/standards/testing.md)。

## 文档导航

不同文档各自解决一个问题：

```text
AGENTS.md       AI 在项目里遵守什么规则
docs/
├── README.md   从哪里进入各类项目文档
├── standards/  长期工程约定
├── features/   用户需求与验收标准
├── plans/      本轮计划、进度与证据
├── designs/    系统当前事实
└── others/     测试用例、决策与交付资料
```

| 继续做什么           | 文档入口                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| 把模板用于自己的项目 | [模板采用指南](./docs/standards/adoption.md)                                     |
| 阅读某项功能的需求   | [Feature 索引](./docs/features/README.md)                                        |
| 开始或接续开发任务   | [开发工作流](./docs/standards/workflow.md) · [Plan 索引](./docs/plans/README.md) |
| 查当前架构和系统设计 | [Design 索引](./docs/designs/README.md)                                          |
| 配置 AI 工具         | [AI 工作台](./.ai/README.md) · [AI 协作规范](./docs/standards/ai-agents.md)      |
| 查看验收和已发布版本 | [验收资料](./docs/others/README.md) · [版本更新](./CHANGELOG.md)                 |

---

<div align="center">
  <p>✦ ───────── ✦ ───────── ✦</p>
  <h2>好想法，不该死在脑子里。</h2>
  <p><sub>从脑海中的念头，到可以被传递的光</sub></p>
  <p>
    <strong>✦ 起念</strong><br>
    想法是火种。<br>
    火种不是烟花——<br>
    烟花亮一瞬，火种要燎原。
  </p>
  <p>
    <strong>🔥 淬炼</strong><br>
    燎原之前，先入炉。<br>
    烈火淬过，杂质褪去，<br>
    直到它有了可以被举起的形状。
  </p>
  <p>
    <strong>✧ 成炬</strong><br>
    那是火炬。<br>
    那是“我想做”，变成了“我做成了”。
  </p>
  <p>
    <strong>↗ 传递</strong><br>
    举起来。<br>
    让人看见，让人借光，让人取暖。<br>
    从一双手，到另一双手。
  </p>
  <p><strong>Ignite</strong></p>
  <p>✨ <strong>星星之火，可以燎原。</strong> ✨</p>
  <p>✦ ───────── ✦ ───────── ✦</p>
</div>
