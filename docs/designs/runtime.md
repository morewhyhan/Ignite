# 当前运行时设计

## 环境变量

| 变量                 | 本地示例                | 生产约束                          |
| -------------------- | ----------------------- | --------------------------------- |
| `APP_ENV`            | `development`           | 必须显式为 `production`           |
| `APP_URL`            | `http://localhost:3000` | HTTPS 纯 origin，不能是 localhost |
| `DATABASE_URL`       | `file:./dev.db`         | 不能使用 `file:` SQLite           |
| `BETTER_AUTH_SECRET` | 本地示例值              | 至少 32 字符高熵随机值            |

本模板的注册登录不依赖外部邮件服务。若产品需要邮箱所有权验证，应作为独立增量模块增加 provider、环境变量、契约测试和 E2E。

## 请求时序

```text
Browser → Next.js route page → module screen → module Hook / React Query
  → Hono Typed Client → Next.js Hono adapter → Hono route
  → session + Zod → Prisma → database
```

服务端 layout 负责 session redirect；业务数据仍统一走 Hook → Hono Typed RPC → Prisma。
