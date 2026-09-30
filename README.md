# Ignite

**从一个问题开始，快速做出产品，并且继续做下去。**

Ignite 是一套轻量、可扩展的 AI 协作全栈开发模板。它把可运行的网站基础、开发流程和项目文档准备好，让你把精力放在想解决的问题上，更快拿到可以体验、可以验证、可以继续修改的产品。

它面向主要借助 AI 开发的个人与小团队：你可能想验证一个产品想法、做一件自己需要的工具，或在真实项目中学习开发。你确定目标与取舍，AI 沿着项目规则实现、检查并接续工作。

## 目录

1. [快速开始](#快速开始)
2. [核心功能](#核心功能)
3. [技术栈](#技术栈)
4. [为什么选择 Ignite](#为什么选择-ignite)
5. [AI 开发 Loop](#ai-开发-loop)
6. [文档导航](#文档导航)

## 快速开始

### 1. 启动本地项目

通过 [Use this template](https://github.com/morewhyhan/Ignite/generate) 创建自己的仓库并克隆到本地。以下命令在项目根目录执行，默认使用已安装 Git 和 nvm 的 WSL/Linux 环境：

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

打开 [localhost:3000](http://localhost:3000)，注册账户后即可进入工作台，体验任务的新增、编辑、完成和删除。默认使用本地数据库，注册无需接入邮件服务。

开发服务端口与 `.env` 中的 `APP_URL` 应保持一致；Windows 与 WSL 各自安装依赖，不共用 `node_modules`。环境准备与排查见[模板采用指南](./docs/standards/adoption.md)。

### 2. 让它成为你的项目

先确定项目名称、目标用户和第一轮要做的功能，再按[采用指南](./docs/standards/adoption.md#第二步建立项目身份)更换品牌、独立密钥和 Git 推送地址，并决定保留、改造还是移除 Tasks 示例。

把仓库交给 AI 时，可以从这样一条任务开始：

```text
先阅读 AGENTS.md 和模板采用指南。
我想做一个自用的读书笔记网站，第一轮需要新增、编辑、删除笔记，并按书名筛选。
请检查现有能力，列清本轮范围和验收标准，再按项目工作流实现、测试并回写文档。
完成后告诉我如何使用、验证了什么，以及还有哪些未完成项。
```

后续每轮开发的完整路径见 [AI 开发 Loop](#ai-开发-loop)。

## 核心功能

| 已经准备好的能力       | 你可以直接做什么                                                            |
| ---------------------- | --------------------------------------------------------------------------- |
| **可运行的网站基础**   | 使用首页、注册登录、工作台和账户设置，体验主题切换与响应式页面。            |
| **完整的业务参考**     | 通过 Tasks 体验增删改查、状态更新和用户数据隔离，参照它开发自己的业务模块。 |
| **AI 协作开发流程**    | 把目标转成需求与验收标准，让 AI 按计划拆解任务、编写测试、实现并检查。      |
| **可接续的项目上下文** | 从文档查清需求、当前设计和未完成任务，换会话后继续推进。                    |
| **可检查的交付结果**   | 运行类型、自动化测试、数据库迁移与浏览器检查，查看对应版本的验证记录。      |
| **按需扩展的项目结构** | 替换品牌、页面和示例业务，沿着明确的模块边界加入新功能。                    |

当前提供的是 **Web 应用基础**。支付、真实邮件、文件存储等服务，以及小程序、移动 App、桌面应用，按具体项目需要接入。模板保持基础功能集中，让后续选择留给你的产品。

详细能力与验收标准：[产品基线](./docs/features/product.md) · [账户认证](./docs/features/auth.md) · [Tasks 示例](./docs/features/tasks.md)。

## 技术栈

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/) [![Hono](https://img.shields.io/badge/Hono-4-e36002?logo=hono)](https://hono.dev/) [![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)](https://www.prisma.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

| 层次       | 技术                                        |
| ---------- | ------------------------------------------- |
| 页面与应用 | Next.js 16、React 19、TypeScript 5          |
| 界面与主题 | Tailwind CSS 4、Radix UI、next-themes       |
| 业务请求   | TanStack Query 5、Hono 4 Typed RPC、Zod 4   |
| 账户认证   | Better Auth：邮箱密码、登录状态管理         |
| 数据存储   | Prisma 6；本地默认使用 SQLite，包含迁移机制 |
| 工程验证   | Vitest、Playwright、ESLint、Prettier        |

Ignite 采用**模块化单体架构**：前端和后端在同一个项目中开发、部署，业务能力按模块组织。

![Ignite 模块化单体架构](./docs/assets/ignite-architecture.svg)

业务数据沿 **页面 → 模块 Hook → Hono Typed RPC → 服务端路由 → Prisma** 流转；认证由 Better Auth 独立处理。页面负责编排，业务放在模块内，方便定位、修改和扩展。

运行时版本以 [`.node-version`](./.node-version) 和 [`package.json`](./package.json) 为准。SQLite 是本地开发默认配置；正式上线需要 HTTPS、独立密钥和持久化生产数据库，详见[交付前验证](./docs/standards/adoption.md#第五步交付前验证)。

深入了解：[架构规范](./docs/standards/architecture.md) · [API 规范](./docs/standards/api.md) · [数据库规范](./docs/standards/database.md)。

## 为什么选择 Ignite

**想法出现时，能尽快开始。** 账户、页面、数据和检查工具已有可运行的起点。你可以围绕第一个真实需求动手，用产品验证想法。

**让 AI 多承担执行，让你集中做决定。** 需求、边界、任务和验收方式写进项目，减少每次重新解释的负担。你把精力放在要解决什么、先做什么。

**第一版之后，还能继续改。** 测试帮助发现回归，设计文档记录当前实现。新增功能、修复问题或切换 AI 会话时，有地方查依据、有结果可核对。

**基础保持精简，产品按需要生长。** 适合自用工具、产品原型和小型业务应用；品牌、页面和示例模块都可以替换，外部服务按需添加。

## AI 开发 Loop

**说清目标，按规格实现，用结果验收，把现状留给下一轮。**

![Ignite AI 开发 Loop](./docs/assets/ignite-ai-loop.svg)

1. **明确需求。** Feature 写清用户要做什么、边界在哪里，以及怎样才算做对。
2. **安排本轮。** Plan 记录实现方案、任务、授权范围与验收入口。
3. **实现并验证。** 先写行为测试，确认它因缺少目标行为而失败；再实现功能、运行检查，失败就定位并修复。
4. **完成后接续。** 把验证证据与被测版本关联，更新 Design 中的当前事实，再开始下一轮。

工程检查通过、单项任务验收、整轮发布验收是三个层次。没有验证的部分要明确保留为待完成；遇到权限、范围或外部条件问题，应记录阻塞，不能用一句“已完成”带过。

所有 AI 工具共用 [`AGENTS.md`](./AGENTS.md) 的项目规则。Claude Code、Cursor、OpenCode 和 GitHub Copilot 的入口引用同一份规则，再按任务读取所需文档。

开始时用 `pnpm ignite status` 查看项目状态；接续任务用 `pnpm ignite next --plan <IGT-ID>` 查看下一步。具体操作见[开发工作流](./docs/standards/workflow.md)，验证方式见[测试规范](./docs/standards/testing.md)。

## 文档导航

README 介绍能力与入口；具体步骤、规则和系统事实在对应文档中维护。

| 你现在想做什么               | 从这里开始                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------- |
| 从模板建立自己的项目         | [模板采用指南](./docs/standards/adoption.md)                                      |
| 了解已有功能与验收要求       | [功能规格索引](./docs/features/README.md)                                         |
| 让 AI 开始或接续一轮开发     | [开发工作流](./docs/standards/workflow.md) · [计划与执行](./docs/plans/README.md) |
| 理解文档如何分工、流转       | [文档系统导览](./docs/README.md)                                                  |
| 查当前的模块、接口与数据设计 | [当前设计索引](./docs/designs/README.md)                                          |
| 查架构、安全、测试等工程约定 | [工程标准索引](./docs/standards/README.md)                                        |
| 配置 AI 工具与项目资产       | [AI 工作台](./.ai/README.md) · [AI 协作规范](./docs/standards/ai-agents.md)       |
| 查验收用例、决策与交付记录   | [验收与决策资料](./docs/others/README.md)                                         |
| 查看已发布版本的变化         | [版本更新说明](./CHANGELOG.md)                                                    |

---

**Ignite your idea. 从一念火种，到万家灯火。**
