# API 标准

- 业务 API 使用 Hono，并在 `src/server/api/index.ts` 注册。
- 客户端只通过共享 Hono Typed RPC client 调用，不手写 endpoint 或直接 `fetch`。
- JSON body、query 和 path 参数必须在边界使用 Zod 校验。
- 私有 API 从 session 获取用户，不信任客户端传入的 `userId` 或 owner。
- 成功响应使用 `{ data }`。
- 错误响应统一使用 `{ code, message }`。
- `401` 表示未登录，`404` 表示不存在或不属于当前用户，`422` 表示输入无效。
- 客户端响应必须先检查 `response.ok`，解析统一复用 `readApiJson`。
- JSON 输入默认使用严格 Zod 对象，未知字段返回 `422`，避免文档契约和实现静默分叉。

## 注册新资源

路由必须通过链式 `route()` 合并到导出的实例，`AppType` 才能包含新 RPC 类型：

```ts
import projectsRoute from './routes/projects'

export const routes = app.route('/', tasksRoute).route('/', projectsRoute)
export type AppType = typeof routes
```

不要先调用 `app.route()`，最后却继续从未链式收窄的 `app` 推导类型。客户端只从
`src/lib/api-client.ts` 使用这个 `AppType`，module Hook 可以从 `hono/client` 导入
`InferRequestType` / `InferResponseType` 类型，但不能再次创建 `hc()`。
