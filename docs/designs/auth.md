# 当前认证设计

> 状态：当前事实

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
- Better Auth 限流按 `APP_ENV` 判断：真实 `production` 开启，`development` 与隔离 `test` 关闭；生产构建 E2E 仍使用 `APP_ENV=test`，不会把同一回环地址上的多个用例互相限流。

Better Auth schema 的 `verification` 表仍保留，用于保持官方 schema 与迁移兼容；它是预留存储，不会在当前基线触发邮件发送。

认证客户端是业务 RPC 的明确例外，不重复创建一套 Hono 认证 API。

- DES-AUTH-101：当前认证与会话边界的事实以本编号引用。

来源：AGENTS.md 认证基线一节；实现见 src/server/auth。

## 事件与命令

按 §9.3 的顺序记录。

| 已发生的变化 | 发起变化的请求     | 责任者      | 规则或策略                                 | 后续变化                          | 分歧和热点             |
| ------------ | ------------------ | ----------- | ------------------------------------------ | --------------------------------- | ---------------------- |
| 会话建立     | 用户提交邮箱与密码 | Better Auth | 认证是独立边界，业务 RPC 从 session 取用户 | 后续请求携带会话，受保护 API 放行 | 是否启用邮箱所有权验证 |
| 会话失效     | 用户登出或会话过期 | Better Auth | 过期即拒绝，未登录返回 401                 | 客户端清除本地状态并跳转登录      | 无                     |
