# ADR-0002：客户端业务数据统一通过 Hook 和 Hono RPC

## 状态

已接受。

## 决策

客户端远程业务数据必须沿着：

```text
module component → module Hook → React Query → Hono Typed RPC → Hono route
```

类型由 `src/server/api/index.ts` 的 `AppType` 推导，响应解析统一使用
`src/lib/api-client.ts` 的 `readApiJson`。

## 例外

- Better Auth Client 负责登录、注册、退出和 session。
- 服务端 layout 可以直接读取 session 做 redirect。
- 邮件等第三方服务只能在服务端 adapter 内直接调用。
- 本地 UI 状态使用 React state。

## 后果

页面不再出现直接 `fetch`、重复 `hc()` 或直接访问 Prisma 的业务实现；ESLint 会检查
客户端边界。
