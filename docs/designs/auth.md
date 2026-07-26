# 当前认证设计

认证由 Better Auth 服务端配置和 auth module 的客户端 Hook 组成：

```text
AuthModal
  → src/modules/auth/hooks/use-auth.ts
  → Better Auth Client
  → /api/auth/*
  → src/server/auth/index.ts
  → Prisma adapter
```

当前能力：

- 邮箱 + 密码注册、登录和退出。
- 密码长度 8–128 个字符。
- session 变化或退出时清空 React Query 私有缓存。
- API 通过 `requireUserId` 从 session 获取当前用户。
- 模板基线不配置真实邮箱、验证码或外部邮件 provider。

Better Auth schema 的 `verification` 表仍保留，用于保持官方 schema 与迁移兼容；它是预留存储，不会在当前基线触发邮件发送。

认证客户端是业务 RPC 的明确例外，不重复创建一套 Hono 认证 API。
