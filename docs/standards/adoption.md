# 模板采用规范

本文件是把 Ignite 复制成一个具体项目时的唯一采用清单。先验证模板基线，再进行产品化改动，可以区分模板原有问题和采用过程中引入的问题。

## 通用模板与具体项目的验收边界

维护 Ignite 时只验收当前模板的运行、认证、Tasks 参考切片、工程规则和检查器。以下决定在复制为具体项目后才有真实答案，不能为了让模板“全绿”预设服务或删除示例：

| 采用时的决定               | 未决定时的模板行为               | 决定后的验收                                     |
| -------------------------- | -------------------------------- | ------------------------------------------------ |
| 产品名称、首页、导航和视觉 | 保留可运行的基线外壳             | 同步 Feature、页面、设计事实和桌面/移动 E2E      |
| Tasks 保留、改造或删除     | 保留完整参考纵向切片             | 同步 Schema、迁移、RPC、Hook、路由和权限回归     |
| 数据库与外部服务           | 只承诺已验证的 SQLite 本地能力   | 按所选 provider 重建隔离测试、环境指纹和迁移证据 |
| GitHub 仓库与部署平台      | 不宣称模板提交已交付给衍生项目   | 核对项目推送目标、远端提交、CI 和可访问入口      |
| AI 工具和运行平台          | 共用 AGENTS 真源，默认 WSL/Linux | 在实际宿主工具和平台上做入口、依赖与浏览器冒烟   |

这些场景在采用 Plan 中形成目标、REQ/AC 和 `remaining_work`，由采用者的实际选择触发；不属于尚未创建的产品也“已经验收”。

## 模板资产分级

| 资产         | 当前内容                                                             | 默认动作                                               |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| 核心基础设施 | Better Auth、Hono RPC、Prisma、React Query、环境校验、测试和文档体系 | 保留；替换属于 `[存量改动]`，风险标为 `infrastructure` |
| 产品外壳     | 品牌、Landing、Dashboard、Settings、Theme、导航                      | 按新产品替换；属于 `[存量改动]`                        |
| 参考纵向切片 | Tasks 数据模型、API、Hook、页面和测试                                | 明确选择保留、改造或删除                               |

`auth`、`theme`、`landing`、`dashboard` 属于基础能力或产品外壳，可以使用单数目录；资源型业务模块使用复数 kebab-case，例如 `projects`、`notifications`。

采用决定应同时落在产品规格、实现与回归检查中；可变外壳与必须保留的安全行为分别核对：

| 决定       | 实现入口                                              | 同步检查                          |
| ---------- | ----------------------------------------------------- | --------------------------------- |
| 名称与介绍 | `src/config/site.ts`、`package.json`、README、Landing | 页面标题、模板残留、Cookie slug   |
| 首页与路由 | `src/app/`、`src/config/navigation.ts`、登录跳转      | 导航入口、重定向、E2E 用户路径    |
| 视觉与主题 | `src/app/globals.css`、`src/modules/theme/`、共享 UI  | 设计事实、桌面与移动视口          |
| Tasks 去留 | Schema、API、Hook、页面、导航                         | 独立认证/权限测试以及对应业务测试 |

当前页面名称、粉色主题和 `/dashboard` 是模板基线，不是衍生产品的永久要求。用户已给出目标时，AI 按目标更新对应测试；权限、秘密信息和持久化约束仍需验收。

## 第一步：验证未修改的基线

当前模板发布快照只带一份基线交付记录，不附带建设 Ignite 的历次 Plan、Release 和运行证据。使用 GitHub 的 “Use this template” 或下载源码后重新 `git init` 时，新仓库没有模板旧提交；先提交初始源码，再运行 `pnpm ignite adopt-history` 查看这一份继承记录，确认后执行 `pnpm ignite adopt-history --apply`。它把基线 Plan、Release 和运行清单归档到 `docs/others/template-history/`，随后为自己的产品创建 Plan。归档只是区分来源，不表示新产品已经验证通过。普通完整克隆保留原 Git 历史，无需归档；浅克隆应先取回完整历史。

```bash
node scripts/runtime-doctor.mjs --preflight
cp .env.example .env
corepack pnpm install --frozen-lockfile
pnpm runtime:check
pnpm db:setup
pnpm verify
pnpm test:e2e:production
```

浏览器用户路径由 `pnpm test:e2e:production` 重放。第一次安装若缺少 Chromium，先执行 `pnpm exec playwright install --with-deps chromium` 再运行该检查；失败时保留报告，不以人工点击作为验收替代。

## 第二步：建立项目身份

必须更新：

- `package.json` 的 `name`；
- `src/config/site.ts` 的 `name`、`slug`、`tagline` 和 `description`；
- `.ai/project.json` 的 `mode`、源仓库和项目目标仓库；`docs/features/product.md` 的目标用户、范围和示例业务决定；
- README 的产品名称和说明；
- `.env` 中的独立 `BETTER_AUTH_SECRET`。
- Git `origin` 的 push URL。完整克隆后必须指向新项目仓库；若暂时只在本地开发，可以先不设置远端，但不得保留指向 Ignite 模板的推送地址。

生成本地 secret：

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`siteConfig.slug` 同时用于认证 Cookie 前缀。浏览器 Cookie 不按端口隔离，所以同时运行多个衍生项目时必须使用不同 slug 和 secret，避免会话互相覆盖。

完成后运行 `pnpm template:doctor`。`.ai/project.json` 是机器可读的项目身份真源：将 `mode` 改为 `adopted`，把 `source_repository` 保留为模板来源，已确定项目仓库时填入 `project_repository`；尚未确定时保持 `null`，本地开发可以继续，但不要宣称已推送。若仍使用 Ignite 名称、slug、默认 secret，或本地既没有 `.env` 也没有等价环境变量，诊断会报告。

诊断会检查 origin 的全部推送目标，避免第二个 push URL 仍指向模板。Site 身份支持字符串字面量、本文件内的 `const` 引用、字符串拼接与 TypeScript 类型包装；函数、外部导入或运行时计算会明确报告“无法静态核实”，不会执行应用代码，也不会把无法识别当作通过。需要这类配置时，应同步扩展诊断适配，而不是绕过采用检查。

## 第三步：决定 Tasks 的去留

### 保留

把它当作产品功能，更新文案、需求规格和设计，不继续称为示例。

### 改造

以 `[存量改动]` 建立 Plan，逐项检查数据模型、API、Hook、页面、导航、测试和设计规格。

### 删除

删除不是只移除 `src/modules/tasks/`。必须在一个可审查的 Plan 中处理：

删除前执行 `pnpm ignite example removal-plan tasks`，取得本项目实际仍存在的文件、注册点、文档和业务测试清单。该命令只读，不删除文件；历史 migration 只列为应保留的记录。参考切片仅在 UI（模块、页面、导航）、API（路由、注册）和当前 Schema（模型、用户关系）全部移除后才判定已删除。只移除其中一处不会跳过 Tasks 所有权回归检查，而会暴露未完成的迁移。

| 区域         | 检查位置                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| 数据         | `prisma/schema.prisma` 的 `task` 和 `user.tasks`，并新增 migration                  |
| API          | `src/server/api/routes/tasks/` 和 `src/server/api/index.ts`                         |
| Client       | `src/modules/tasks/`                                                                |
| Route        | `src/app/dashboard/tasks/`                                                          |
| Navigation   | `src/config/navigation.ts`                                                          |
| Tests        | Tasks API/E2E 和专属契约；独立 `tests/e2e/auth.spec.ts`、认证与路由守卫测试必须保留 |
| Requirements | `docs/features/tasks.md`                                                            |
| Designs      | domain、database、API、sequence 和测试用例规格                                      |
| README/Agent | Tasks 参考切片说明                                                                  |

已经在共享环境应用的 migration 不得删除或改写。模板尚未发布且没有共享数据时，重建基线也必须作为明确的基础设施任务处理。

当 Tasks 被移除时，在覆盖本轮采用目标的 Plan 中给业务数据与访问路径安排迁移，再调整专属测试和设计文档；没有匹配 Plan 时再新建。不能通过删除测试来获得绿色结果；原有认证、跨用户资源隔离和未授权访问的安全断言需要由独立于 Tasks 的测试继续覆盖。

## 第四步：开发第一个真实模块

可以先执行 `pnpm create:module <plural-kebab-name> --dry-run` 查看将创建的文件，确认后去掉 `--dry-run`。脚手架会创建 Screen、公开入口、Feature、schema 2 Plan、一个明确失败的验收测试，并把 Plan 纳入 Release；它不猜测数据模型或 API。

1. 从脚手架或 `docs/features/_template.md` 创建需求规格。
2. 标明是增量模块还是存量修改，补齐字段、原型映射和正交业务规则。
3. 完善脚手架已生成的 Plan；手工创建模块时才使用 `docs/plans/_template.md`，不要重复创建同一个结果的 Plan。
4. 把占位失败测试换成用户行为断言，补齐 AC 的真实层级与具体测试路径：页面需要浏览器验收，持久化需要真实数据库验收，外部集成需要对应服务的验收。同步 Plan 的 `verification_requirements`，关闭开放问题后进入 `ready`、`active`。
5. 按 `docs/standards/workflow.md` 的测试先行 Loop 实现，以 `pnpm ignite next --plan <IGT-ID>` 接续任务，完成后更新 `docs/designs/`。

新增业务应建立独立纵向切片，不塞入 Dashboard、Settings 或 Tasks 等无关模块。

本轮模块开发中的缺陷修复、补测试和设计回写留在这份 Plan。已交付后出现的新改动使用下一份 Plan；Feature 和 Design 只更新受本次改动影响的内容。

## 第五步：交付前验证

```text
pnpm ignite plan validate <IGT-ID>
pnpm ignite check --plan <IGT-ID> --level integration
pnpm ignite plan set-status <IGT-ID> verifying --commit HEAD
pnpm ignite check --plan <IGT-ID> --level release
pnpm ignite plan set-status <IGT-ID> done
```

`pnpm build` 只证明当前配置可以完成生产编译。真实生产部署必须把 `APP_ENV` 设为 `production`，并满足 HTTPS、持久数据库和独立 secret；SQLite 默认值不能直接作为无状态生产部署方案。邮箱所有权验证如有需要，另行作为增量模块接入。
