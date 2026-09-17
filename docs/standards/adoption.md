# 模板采用规范

本文件是把 Ignite 复制成一个具体项目时的唯一采用清单。先验证模板基线，再进行产品化改动，可以区分模板原有问题和采用过程中引入的问题。

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

如果使用 GitHub 的 “Use this template” 或下载源码后重新 `git init`，新仓库没有模板旧提交。先提交初始源码，再运行 `pnpm ignite adopt-history` 查看继承记录；确认列表后执行 `pnpm ignite adopt-history --apply`。它把旧 Plan、Release 和运行清单原样归档到 `docs/others/template-history/`，保留恢复索引，随后新建的 Plan 使用新仓库的基线。归档不代表旧任务已验证。普通完整克隆无需此操作；浅克隆应先取回完整历史。

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

## 第三步：决定 Tasks 的去留

### 保留

把它当作产品功能，更新文案、需求规格和设计，不继续称为示例。

### 改造

以 `[存量改动]` 建立 Plan，逐项检查数据模型、API、Hook、页面、导航、测试和设计规格。

### 删除

删除不是只移除 `src/modules/tasks/`。必须在一个可审查的 Plan 中处理：

| 区域         | 检查位置                                                           |
| ------------ | ------------------------------------------------------------------ |
| 数据         | `prisma/schema.prisma` 的 `task` 和 `user.tasks`，并新增 migration |
| API          | `src/server/api/routes/tasks/` 和 `src/server/api/index.ts`        |
| Client       | `src/modules/tasks/`                                               |
| Route        | `src/app/dashboard/tasks/`                                         |
| Navigation   | `src/config/navigation.ts`                                         |
| Tests        | Tasks API/E2E；认证和路由守卫测试必须仍有独立覆盖                  |
| Requirements | `docs/features/tasks.md`                                           |
| Designs      | domain、database、API、sequence 和测试用例规格                     |
| README/Agent | Tasks 参考切片说明                                                 |

已经在共享环境应用的 migration 不得删除或改写。模板尚未发布且没有共享数据时，重建基线也必须作为明确的基础设施任务处理。

## 第四步：开发第一个真实模块

可以先执行 `pnpm create:module <plural-kebab-name> --dry-run` 查看将创建的文件，确认后去掉 `--dry-run`。脚手架会创建 Screen、公开入口、Feature、schema 2 Plan、一个明确失败的验收测试，并把 Plan 纳入 Release；它不猜测数据模型或 API。

1. 从脚手架或 `docs/features/_template.md` 创建需求规格。
2. 标明是增量模块还是存量修改，补齐字段、原型映射和正交业务规则。
3. 从 `docs/plans/_template.md` 创建 Plan，关闭开放问题。
4. 按 `docs/standards/workflow.md` 的测试先行 Loop 实现。
5. 完成后更新 `docs/designs/`。

新增业务应建立独立纵向切片，不塞入 Dashboard、Settings 或 Tasks 等无关模块。

## 第五步：交付前验证

```text
pnpm ignite plan validate <IGT-ID>
pnpm ignite check --plan <IGT-ID> --level integration
pnpm ignite plan set-status <IGT-ID> verifying --commit HEAD
pnpm ignite check --plan <IGT-ID> --level release
pnpm ignite plan set-status <IGT-ID> done
```

`pnpm build` 只证明当前配置可以完成生产编译。真实生产部署必须把 `APP_ENV` 设为 `production`，并满足 HTTPS、持久数据库和独立 secret；SQLite 默认值不能直接作为无状态生产部署方案。邮箱所有权验证如有需要，另行作为增量模块接入。
