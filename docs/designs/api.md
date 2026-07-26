# 当前 API 设计

API 组合真源是 `src/server/api/index.ts`，Next.js 适配入口是
`src/app/api/[[...route]]/route.ts`。

当前资源：

| 资源   | 方法和路径              | 认证        | 输入                                      |
| ------ | ----------------------- | ----------- | ----------------------------------------- |
| health | `GET /api/health`       | 否          | 无                                        |
| auth   | `/api/auth/*`           | Better Auth | 由 Better Auth Client 定义                |
| tasks  | `GET /api/tasks`        | 必须登录    | 无                                        |
| tasks  | `POST /api/tasks`       | 必须登录    | `{ title: string }`                       |
| task   | `PUT /api/tasks/:id`    | 必须登录    | `{ title?: string, completed?: boolean }` |
| task   | `DELETE /api/tasks/:id` | 必须登录    | UUID path param                           |

任务输入约束：

- `title` 会 trim，长度为 1–200。
- `id` 必须是 UUID。
- 更新请求至少提供一个可更新字段。
- 创建和更新请求采用严格对象契约，未知字段返回 `422`，不会被静默忽略。

统一响应：

```json
{ "data": "<success payload>" }
```

错误响应：

```json
{ "code": 401, "message": "Unauthorized" }
```

状态码语义为 `401` 未登录、`404` 不存在或越权、`422` 输入无效、`500` 未预期错误。

客户端请求路径为：

```text
module Hook → src/lib/api-client.ts → AppType → Hono route
```

认证由 Better Auth Client 处理，不重复创建认证 RPC；服务端 session 守卫和第三方
服务 adapter 也不属于业务 API 资源。
