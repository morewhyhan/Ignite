# Ignite AI 开发规则

收到修改要求，先读 [GOAL.md](GOAL.md) 与 [开工提示词](PROMPT.md)，再动代码。

## 开发入口

```
GOAL.md    目标、领域、REQ、AC、状态看板（需求真源）
PROMPT.md  每轮开工提示词（读什么、怎么报、失败了回哪）
docs/      五层文档：需求细节、设计事实、工程标准、决策、证据
```

## 每轮固定顺序

```
1. pnpm goal:audit      需求自洽吗，不自洽就停
2. 读 GOAL 的 REQ 与 AC，再读链接的 Feature 与 Design
3. 改代码与测试，测试标题带 [AC-编号]
4. pnpm test && pnpm docs:check && pnpm goal:trace
5. pnpm goal:status --run，把状态写回 GOAL
```

报告开头写“步骤 n/5 · REQ · AC”，结尾写改了哪些文件、跑了什么、结果如何。

## 跑不通时

```
AC 的期望存在、实现不符  → bug，回 docs/features、docs/designs、tests 修
AC 缺失 / 两条冲突        → 需求问题，停下给缺口清单，由人补 GOAL
```

缺口清单写四行：缺在哪、现象、影响、建议。

## 架构边界

- `src/app/` 只放路由壳与页面编排；业务 UI 放 `src/modules/<module>/`。
- 客户端业务数据只走 `module Hook → Hono Typed RPC → route → Prisma`。
- 业务类型以 `AppType` 为唯一真源；浏览器端不直接 `fetch` 业务 API。
- Hono route 必须用 `zValidator`、session guard 和统一错误格式。
- 服务端 secret、数据库、认证配置只放 `src/server/`。

## 认证与权限

- 只用自带的邮箱密码注册、登录、登出、session；不发真实邮件。
- API 从 session 取用户，绝不信任客户端传的 `userId`。
- 未登录访问受保护 API 返回 401；无权访问私有资源返回 404。
- 权限在应用层与查询条件里拦，前端隐藏按钮不算权限。

## 环境与数据库

- 运行时以 `.node-version`、`packageManager` 为准；先跑 `pnpm runtime:check`。
- 不提交 `.env`；`APP_ENV` 显式设为 development / test / production。
- 改 Prisma schema 必须生成具名 migration，并跑 `pnpm test:migrations`。
- 已应用的 migration 不得重写、改名或删除。

## 文档规则

- 需求只写在 GOAL.md 与 `docs/features/`，同一份 AC 两处文字必须一致。
- 现状写在 `docs/designs/`，每份设计开头写“关联需求：REQ-…”。
- 规则写在 `docs/standards/`，术语一义一词。
- 贵且不可逆的选择写进 `docs/others/adr/`。
- 证据：`pnpm goal:status --run` 生成运行日志；浏览器类 AC 必须有截图。

## 沟通

- 先复述理解的目标、结果和边界，再动手。
- 先说结论，再说依据与未定部分；事实、推测、建议分开写。
- 需要人决定时给选项、结果与代价，不替人拍板。

## 计划（可选）

默认不建计划。跨多天、多人协作、数据迁移、权限模型、金额计算时才建一份，交付后归档。
