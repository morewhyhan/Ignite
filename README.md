<div align="center">
  <h1>Ignite</h1>
  <p><strong>从一个问题开始，快速做出产品，并且继续做下去。</strong></p>
  <p>一个面向个人开发者与小团队的 AI 友好型全栈开发模板。</p>
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

Ignite 是为快速解决真实问题准备的全栈开发模板。很多项目的开始都很相似：一个想法出现了，时间有限，希望尽快做出一个能运行的版本。AI 让页面、接口和数据库的生成变得很快，真正困难的部分却常常出现在第一次修改之后：代码开始分散，边界变得模糊，AI 需要反复重新理解上下文，产品明明已经能跑，却越来越让人不敢继续碰。

Ignite 提供一个可以直接运行的起点，也把后续开发需要遵守的工程边界和验证方式组织起来。你可以从真正要解决的问题开始，快速做出第一个可验证的版本；之后每一次新增、修改和修复，都沿着同一条路径推进，让快速开发有清楚的边界和可检查的结果。

它尤其适合**独立产品、比赛、黑客松和小团队的快速验证项目**：你有明确的问题和时间压力，希望 AI 尽可能多地承担执行工作，同时仍然掌握产品方向、工程边界和交付质量。主要借助 AI 开发，或希望在真实项目中边做边学，也可以从这里开始。

Ignite 关心的结果很具体：让你更容易开始，在有限时间内交付一个真实可用的版本，并且在第一版完成后仍然有信心继续修改和扩展。

**让 AI 负责执行，让工程规范守住方向，让产品持续向前。**

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#核心功能">核心功能</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#为什么选择-ignite">为什么选择 Ignite</a> ·
  <a href="#ai-开发-loop">AI 开发 Loop</a> ·
  <a href="#文档系统与导航">文档系统与导航</a>
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

拿到 Ignite，你同时得到可运行的应用、可参考的业务示例，以及配套的 AI 开发流程。

### ⚡ 开箱即用的应用基础

首页、邮箱密码注册登录、工作台、账户设置、主题切换和响应式布局已经具备。Tasks 提供创建、编辑、完成、删除与账户间数据隔离的完整示例，方便你沿着页面、接口到数据库的链路开发自己的功能。

[查看现有功能 →](./docs/features/README.md)

### 🧭 有规则、有上下文的 AI 协作

统一入口告诉 AI 如何工作；需求说明要做什么，计划记录这一轮的任务，设计文档保存系统现状。换会话、换工具或继续加功能时，AI 能从项目文件中接续工作，减少反复解释背景。

[了解文档如何配合 →](./docs/README.md)

### 🔎 可以核对的交付结果

按验收标准编写测试，用自动化检查验证接口、数据迁移与浏览器中的实际操作。检查结果与对应计划、被测版本关联；完成了什么、还缺什么，都有记录可查。

[查看开发与验收流程 →](./docs/standards/workflow.md)

### 🧩 为你的业务留出空间

品牌、页面和 Tasks 都可替换；业务按模块组织，方便逐步增加自己的能力。当前基线提供 Web 应用，支付、真实邮件、文件存储与其他平台客户端按项目需要再接入。

[从模板开始自己的项目 →](./docs/standards/adoption.md)

## 技术栈

| 应用层     | 基础技术                                                         |
| ---------- | ---------------------------------------------------------------- |
| 页面与界面 | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Radix UI |
| 业务请求   | TanStack Query 5 · Hono Typed RPC · Zod 4                        |
| 账户与数据 | Better Auth · Prisma 6 · SQLite（本地默认）                      |
| 开发与验证 | Vitest · Playwright · ESLint · Prettier                          |

Ignite 采用**模块化单体架构**：前端和后端在同一个 Next.js 项目中组织，每个业务能力保持清晰的模块边界。

<p align="center">
  <img src="./docs/assets/ignite-architecture.svg" width="680" alt="Ignite 模块化单体架构">
</p>

通用界面由共享组件提供，业务代码放在 `src/modules/`，页面只负责组合和路由。业务数据沿 **页面 → 模块 Hook → Hono Typed RPC → Hono 路由 → Prisma** 流转，认证由 Better Auth 处理。测试、文档和数据库迁移围绕这条链路，为后续修改提供依据和验证。

正式部署需要 HTTPS、独立密钥和持久化生产数据库；运行时版本以 [`.node-version`](./.node-version) 与 [`package.json`](./package.json) 为准。深入了解：[架构](./docs/standards/architecture.md) · [API](./docs/standards/api.md) · [数据库](./docs/standards/database.md)。

## 为什么选择 Ignite

- **比赛与黑客松**：时间有限，希望尽快交付可以演示、可以操作的版本。现成的应用基础让你更早开始做核心功能，测试帮助检查关键路径。
- **独立产品与个人工具**：先解决一个真实问题，再根据使用反馈调整。基础功能保持精简，品牌、界面和 Tasks 示例都可以替换，业务按需要扩展。
- **小团队的快速验证**：希望 AI 多承担实现工作，同时清楚每轮做什么、做到哪里。需求、计划和当前设计随项目保留，方便继续迭代与交接。

这些场景都需要尽快拿到结果，也需要在第一版之后继续修改。Ignite 把可运行的基础、开发约定和验证方式放在一起，让你把更多精力留给问题本身与产品取舍。

## AI 开发 Loop

每个功能都沿着同一条路径推进：

`问题 → Feature → Plan → Contract / Test → AI 实现 → Verify → Design → 下一轮增量`

<p align="center">
  <img src="./docs/assets/ignite-ai-loop.svg" width="760" alt="Ignite AI 开发 Loop">
</p>

这套 Loop 的判断逻辑很明确：先把需求、约束和验收标准写进 Feature / Plan，再按规格编写行为测试，确认它因缺少目标行为而失败，然后实现功能。运行检查后，结果决定下一步——通过就记录证据并更新 Design，不通过就修改代码、重新验证；超出授权或缺少外部条件时，明确记录阻塞。

人确定问题、目标、边界和验收标准；AI 调查代码、编写测试、实现功能并整理结果；测试、构建和迁移检查为结果提供证据。

开发规则写入 [`AGENTS.md`](./AGENTS.md)。完成判定依据验收标准与对应版本的验证记录，工程检查通过、单项任务验收和整轮发布验收分别记录。

开始新一轮时，用 `pnpm ignite status` 查看状态，用 `pnpm ignite next --plan <IGT-ID>` 接续计划。完整顺序与操作说明见[开发工作流](./docs/standards/workflow.md)，验证方式见[测试规范](./docs/standards/testing.md)。

## 文档系统与导航

README 负责介绍与导航，具体规则和项目资料在文档系统中维护：

```text
AGENTS.md       AI 在项目里遵守什么规则
.ai/            项目专属 AI 工具资产（Skills / MCP）
docs/
├── README.md   从哪里进入各类项目文档
├── standards/  长期工程约定
├── features/   用户需求与验收标准
├── plans/      本轮计划、进度与证据
├── designs/    系统当前事实
└── others/     测试用例、决策与交付资料
```

**Feature 说明要做什么，Plan 说明这轮怎么做，Test 证明是否做对，Design 记录现在是什么；Standards 贯穿整个过程。** Plan 保留这一轮的过程，Design 随实现更新当前事实，让下一轮开发有据可依。

所有 AI 工具共用 [`AGENTS.md`](./AGENTS.md) 的项目规则，再按任务读取相关文档。Claude Code、Cursor、OpenCode 和 GitHub Copilot 的入口引用同一份规则，避免各自维护一套约定。具体配置见 [AI 工作台](./.ai/README.md)。

模板发布快照只携带可复用资料。复制后从自己的第一份 Plan 开始，Ignite 建设期的任务、审计报告和运行记录保存在 Git 历史中。

| 继续做什么             | 文档入口                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- |
| 把模板用于自己的项目   | [模板采用指南](./docs/standards/adoption.md)                                     |
| 理解文档如何配合       | [文档系统导览](./docs/README.md)                                                 |
| 阅读某项功能的需求     | [Feature 索引](./docs/features/README.md)                                        |
| 开始或接续开发任务     | [开发工作流](./docs/standards/workflow.md) · [Plan 索引](./docs/plans/README.md) |
| 查当前架构和系统设计   | [Design 索引](./docs/designs/README.md)                                          |
| 查架构、安全与测试约定 | [工程标准索引](./docs/standards/README.md)                                       |
| 配置 AI 工具           | [AI 工作台](./.ai/README.md) · [AI 协作规范](./docs/standards/ai-agents.md)      |
| 查看验收和已发布版本   | [验收资料](./docs/others/README.md) · [版本更新](./CHANGELOG.md)                 |

---

<div align="center">
  <p><strong>Ignite your idea.</strong></p>
  <p>从一念想法，到万家灯火。</p>
</div>
