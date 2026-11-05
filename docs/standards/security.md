# 安全标准

- 服务端从 session 获取当前用户，永远不信任客户端传入的所有权字段。
- 私有数据读写必须带 session user id；越权和不存在统一返回 `404`。
- secret、数据库、认证和邮件配置只能在 `src/server/` 使用。
- 不记录密码、token、cookie、secret 或密码重置链接。
- 生产必须使用 HTTPS、强随机 Better Auth secret 和持久化数据库。邮箱所有权验证属于可选增量能力，不是模板基线依赖。
- 生产环境变量由 `src/server/env.ts` 统一校验，不得绕过启动保护。
