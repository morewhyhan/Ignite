<div align="center">
  <h1>Ignite</h1>
  <p><strong>从一个问题开始，快速做出产品，并且继续做下去</strong></p>
  <p>一个面向个人开发者、独立产品和小团队的 AI 友好型全栈开发模板。</p>
  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-111111?logo=next.js&logoColor=white" alt="Next.js 16"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5"></a>
    <a href="https://hono.dev/"><img src="https://img.shields.io/badge/Hono-4-e36002?logo=hono&logoColor=white" alt="Hono 4"></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma&logoColor=white" alt="Prisma 6"></a>
  </p>
  <p>
    <a href="https://github.com/morewhyhan/Ignite/generate"><strong>使用这个模板 ↗</strong></a>
    &nbsp; · &nbsp;
    <a href="#开始使用">快速开始</a>
    &nbsp; · &nbsp;
    <a href="./docs/README.md">阅读文档</a>
  </p>
</div>

<p align="center"><sub><a href="#开始使用">01　快速开始</a>　·　<a href="#ai-开发-loop">02　开发流程</a>　·　<a href="#文档系统">03　文档系统</a>　·　<a href="#基本架构">04　代码架构</a></sub></p>

---

AI 可以很快生成第一版；真正磨人的是需求不断变化后，原先的目标和决策逐渐散失，AI 需要反复重建上下文，改完也难确认结果是否可靠。Ignite 把这段开发过程组织成三个互相支撑的部分：

1. **能直接启动的产品底座**：已有首页、邮箱密码注册登录、工作台、设置页、Tasks 参考业务和本地 SQLite；注册不依赖真实邮件。
2. **AI 能接续的工作上下文**：一份项目规则真源、清楚的文档分工，以及从规格到验证的开发 Loop。
3. **后续改动有明确边界**：业务模块化组织、统一 API 链路；复杂度出现时再增加相应分层或平台适配。

它适合快速验证产品、参加比赛或黑客松，也适合边做边学、从小工具开始持续迭代。模板不预装支付、真实邮件、文件存储、队列或多租户；先解决当前问题，再按需要增加能力。

<a id="开始使用"></a>

## 开始使用

通过 [Use this template](https://github.com/morewhyhan/Ignite/generate) 创建自己的仓库。推荐在 WSL/Linux x64 中运行；准备好 Git 和 nvm 后，在项目根目录执行：

```bash
nvm install "$(tr -d '\r\n' < .node-version)"
nvm use "$(tr -d '\r\n' < .node-version)"
corepack enable
node --version # 应与 .node-version 完全一致
node scripts/runtime-doctor.mjs --preflight
cp .env.example .env
pnpm install --frozen-lockfile
pnpm runtime:check
pnpm template:doctor
pnpm ignite status --write
pnpm db:setup
pnpm dev
```

打开 [localhost:3000](http://localhost:3000)，注册后可体验工作台和 Tasks。Tasks 是一条从页面到数据库的完整参考切片，可供参考、改造或删除。采用模板后，按[采用指南](./docs/standards/adoption.md)更换项目名称、标识和本地密钥，并针对自己的功能与部署环境重新验收。

Windows 与 WSL 不应共享 `node_modules`；切换环境时，按对应平台重新安装依赖。

状态摘要由上面的命令按当前仓库生成，初始为零 Plan、零 Release。若复制源码后重新建立 Git 历史，也需生成自己的摘要。创建第一个模块前，提交需要保留的初始化变更，保持 Git 工作区干净。

---

<a id="ai-开发-loop"></a>

## AI 开发 Loop

你确定问题、目标、边界和验收方式；AI 按照项目上下文制定本轮计划、编写测试和实现，再根据运行结果修正。通过验证后，更新系统当前设计，进入下一轮。

<p align="center">
  <img src="./docs/assets/ignite-ai-loop.svg" width="760" alt="Ignite AI 开发 Loop">
</p>

具体来说，Feature 说明用户需要什么，Plan 锁定本轮目标和验收范围；实现前，目标行为测试应按预期失败，实现后再运行测试和检查。失败就修复重跑；通过后回写 Design。缺少账号、外部服务或用户决策时，任务明确保持阻塞，不把未验证的工作报成完成。规则见 [`AGENTS.md`](./AGENTS.md)。

人负责产品方向、范围和关键取舍；AI 负责调查、拆解、实现、验证和整理结果。状态可接续，完成条件有证据。

<details>
<summary>查看任务状态与命令</summary>

用 `pnpm ignite status` 查看当前任务；用 `pnpm ignite --help` 查看命令。需要读取完整机器状态时，使用 `pnpm ignite status --json`。具体操作见[计划与执行](./docs/plans/README.md)，验证方式见[测试规范](./docs/standards/testing.md)；跨 Plan 依赖、共享写入与交接也在 [Plan 规则](./docs/plans/README.md#跨-plan-依赖与交接) 维护。

</details>

---

<a id="文档系统"></a>

## 文档系统

文档为开发过程保存上下文。每类信息有自己的位置，AI 能据此判断该读什么、该更新什么：

```text
Ignite/
├── AGENTS.md
├── .ai/
├── docs/
│   ├── standards/
│   ├── features/
│   ├── plans/
│   ├── designs/
│   └── others/
└── tests/
```

记住这组分工就够了：**功能规格（Feature）定义需求，计划（Plan）管理本轮，工程标准（Standards）约束做法，设计（Design）记录当前事实，测试和检查提供证据。**`Plan` 说明“这一轮怎么完成”，`Design` 说明“系统现在是什么”。

`AGENTS.md` 是项目规则的唯一真源；Claude Code、Cursor、OpenCode 和 GitHub Copilot 通过各自的轻量入口引用它。`.ai/` 登记项目使用的 Skills、MCP 和运行环境。工具入口可以变化，项目规则不必复制维护多份。

交付证据绑定本轮基线、验收和被测版本。工程门禁、Plan 验收和 Release 验收各有边界；完整运行日志留在本机，仓库只保存脱敏摘要。

### 文档导航

- **第一次采用模板**：[采用指南](./docs/standards/adoption.md) · [已有功能](./docs/features/README.md)
- **开始一轮开发**：[需求编写](./docs/features/README.md) · [计划与执行](./docs/plans/README.md)
- **协调多项交付**：[Plan 依赖与交接](./docs/plans/README.md#跨-plan-依赖与交接) · [Release 范围与完成](./docs/plans/releases/README.md)
- **了解工程约定**：[架构与安全标准](./docs/standards/README.md) · [测试标准](./docs/standards/testing.md)
- **查询当前系统**：[设计索引](./docs/designs/README.md) · [AI 工具配置](./.ai/README.md)
- **追溯交付和变化**：[决策与验收](./docs/others/README.md) · [更新日志](./CHANGELOG.md)

---

<a id="基本架构"></a>

## 基本架构

Ignite 采用**模块化单体架构**：前后端在同一项目中组织，业务按模块划分。大多数功能可以在一个仓库里完成页面、接口和数据库改动；只有复杂度真实出现时，才增加相应分层或平台适配。

<p align="center">
  <img src="./docs/assets/ignite-architecture.svg" width="680" alt="Ignite 模块化单体架构">
</p>

`src/app/` 负责路由与页面编排，`src/modules/` 保存业务界面和 Hook，`src/server/` 集中处理 Hono API 与 Prisma 数据访问，`src/components/ui/` 提供共享界面组件。

业务数据沿着 **页面 → 模块 Hook → Hono Typed RPC → Hono 路由 → Prisma** 流动。业务类型共享同一 API 契约；API client 支持注入传输方式，为后续端复用业务契约留出边界，而不要求各端共用浏览器实现。认证由 Better Auth 单独处理。

验证使用 Vitest 与 Playwright，数据库变更由 Prisma migration 管理。当前技术栈：

<p align="center"><sub>Next.js 16　·　React 19　·　TypeScript 5　·　Tailwind CSS 4　·　Hono 4　·　React Query 5　·　Prisma 6　·　SQLite</sub></p>

[架构规范](./docs/standards/architecture.md) · [API 设计](./docs/designs/api.md) · [数据库设计](./docs/designs/database.md)

---

## Ignite 的理想

<div align="center">
  <h2>好想法死在脑子里，<br>是最可惜的。</h2>
  <p>想法是火种，不是烟花。</p>
  <p><strong>烟花亮一瞬，火种是要燎原的。</strong></p>
  <p>火种钻进炉火，烈火淬过，杂质褪去，<br>直至它有了可以被举起的形状。</p>
  <p>那是火炬。<br>那是“我想做”，变成了“我做成了”。</p>
  <p>举起来。<br>让人看见，让人借光，让人取暖。<br>从一双手，到另一双手。</p>
  <p><strong>Ignite your idea.</strong><br><sub>从一念想法，到万家灯火。</sub></p>
  <h3>✦ 让星星之火得以燎原。</h3>
</div>

> **别让想法卡在技术准备上。**
>
> AI 可以很快帮你做出一个能展示的样子；难的是让它真正解决问题、稳定好用，出了问题能修，需求变了也能接着改。Ignite 会先帮你理清想解决什么问题、谁会需要它，再用清楚严谨的方法一步步实现和检查，让每次修改都对准最初的目标。哪怕你不懂技术、不懂商业，想法也只是雏形，也能从一粒火种开始，把它做成经得起真实使用的产品，让那束光不止亮在屏幕上，更照进真实生活。
