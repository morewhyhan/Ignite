# 模板采用规范

本文件是把 Ignite 复制成一个具体项目时的唯一采用清单。先验证模板基线，再进行产品化改动，可以区分模板原有问题和采用过程中引入的问题。

## 模板资产分级

| 资产         | 当前内容                                                             | 默认动作                        |
| ------------ | -------------------------------------------------------------------- | ------------------------------- |
| 核心基础设施 | Better Auth、Hono RPC、Prisma、React Query、环境校验、测试和文档体系 | 保留；替换属于 `[基础设施变更]` |
| 产品外壳     | 品牌、Landing、Dashboard、Settings、Theme、导航                      | 按新产品替换；属于 `[存量改动]` |
| 参考纵向切片 | Tasks 数据模型、API、Hook、页面和测试                                | 明确选择保留、改造或删除        |

`auth`、`theme`、`landing`、`dashboard` 属于基础能力或产品外壳，可以使用单数目录；资源型业务模块使用复数 kebab-case，例如 `projects`、`notifications`。

## 第一步：验证未修改的基线

```powershell
Copy-Item .env.example .env
corepack pnpm install --frozen-lockfile
corepack pnpm db:setup
corepack pnpm check
corepack pnpm test:migrations
corepack pnpm test:e2e
```

再手动完成一次：注册或登录 → 打开任务页 → 创建、编辑、完成、删除任务 → 退出登录。

## 第二步：建立项目身份

必须更新：

- `package.json` 的 `name`；
- `src/config/site.ts` 的 `name`、`slug`、`tagline` 和 `description`；
- `docs/features/product.md` 的状态、目标用户、范围和示例业务决定；
- README 的产品名称和说明；
- `.env` 中的独立 `BETTER_AUTH_SECRET`。

生成本地 secret：

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`siteConfig.slug` 同时用于认证 Cookie 前缀。浏览器 Cookie 不按端口隔离，所以同时运行多个衍生项目时必须使用不同 slug 和 secret，避免会话互相覆盖。

完成后运行 `pnpm template:doctor`。在 `docs/features/product.md` 状态改为
`adopted` 后，仍使用 Ignite 名称、slug、默认 secret 或缺少 `.env` 都会被报告。

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

可以先执行 `pnpm create:module <plural-kebab-name> --dry-run` 查看将创建的文件，确认后去掉 `--dry-run`。脚手架只创建 Screen、公开入口、Feature 和 Plan，不猜测数据模型或 API。

1. 从脚手架或 `docs/features/_template.md` 创建需求规格。
2. 标明是增量模块还是存量修改，补齐字段、原型映射和正交业务规则。
3. 从 `docs/plans/_template.md` 创建 Plan，关闭开放问题。
4. 按 `docs/standards/workflow.md` 的测试先行 Loop 实现。
5. 完成后更新 `docs/designs/`。

新增业务应建立独立纵向切片，不塞入 Dashboard、Settings 或 Tasks 等无关模块。

## 第五步：交付前验证

```text
pnpm docs:check
pnpm check
pnpm test:migrations
pnpm build
pnpm test:e2e
```

`pnpm build` 只证明当前配置可以完成生产编译。真实生产部署必须把 `APP_ENV` 设为 `production`，并满足 HTTPS、持久数据库和独立 secret；SQLite 默认值不能直接作为无状态生产部署方案。邮箱所有权验证如有需要，另行作为增量模块接入。
