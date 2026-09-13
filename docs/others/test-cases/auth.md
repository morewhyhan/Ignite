# 测试用例：认证与会话

## 关联规格

- Feature：[`../../features/auth.md`](../../features/auth.md)
- Design：[`../../designs/auth.md`](../../designs/auth.md)

## 用户路径

| 验收标准    | Given             | When                                       | Then                          | 层级           | 自动化位置                                                       |
| ----------- | ----------------- | ------------------------------------------ | ----------------------------- | -------------- | ---------------------------------------------------------------- |
| AC-AUTH-003 | 未登录用户        | 访问 `/dashboard`                          | 跳转首页                      | E2E            | `tests/e2e/auth.spec.ts`                                         |
| AC-AUTH-001 | 新邮箱和合法密码  | 注册                                       | 创建账户并进入 Dashboard      | E2E            | `tests/e2e/auth.spec.ts`                                         |
| AC-AUTH-003 | 已登录用户        | 退出后再次访问 Dashboard                   | session 失效并回到首页        | E2E            | `tests/e2e/auth.spec.ts`                                         |
| AC-AUTH-002 | 已注册用户        | 使用正确凭证登录                           | 恢复 session 并进入 Dashboard | E2E            | `tests/e2e/auth.spec.ts`                                         |
| AC-AUTH-004 | 无 session        | 请求受保护业务 API                         | 返回统一 `401`                | API            | `tests/api/tasks.test.ts`                                        |
| AC-AUTH-005 | test / production | 初始化 Better Auth                         | 仅真实生产环境启用认证限流    | Contract + E2E | `tests/contracts/auth-runtime.test.ts`、`tests/e2e/auth.spec.ts` |
| 环境契约    | 生产配置          | 使用 localhost、开发 secret 或 file 数据库 | 启动配置校验失败              | Contract       | `tests/contracts/server-env.test.ts`                             |

## 尚未自动化

本模板不接入真实邮箱；如果项目后续启用邮箱验证，再新增 provider、送达和链接点击用例。
