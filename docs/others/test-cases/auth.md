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

## 按需扩展

本模板不接入真实邮箱；如果项目后续启用邮箱验证，再新增 provider、送达和链接点击用例。

## 结论记录

<a id="ac-auth-001"></a>

### AC-AUTH-001 认证用例 AC-AUTH-001

- 用例：真实浏览器注册，填写合法邮箱与密码
- 期望：创建账户并进入工作台
- 结果：通过（Playwright，6 passed，38.5s）
- 证据：[截图](../../others/evidence/AC-AUTH-001/2026-11-08.png)
- 未覆盖：非法邮箱、弱密码

<a id="ac-auth-002"></a>

### AC-AUTH-002 认证用例 AC-AUTH-002

- 用例：真实浏览器登录，使用已注册凭证
- 期望：进入自己的工作台
- 结果：通过（Playwright）
- 证据：[截图](../../others/evidence/AC-AUTH-002/2026-11-08.png)
- 未覆盖：错误密码、账号锁定

<a id="ac-auth-003"></a>

### AC-AUTH-003 认证用例 AC-AUTH-003

- 用例：登录后登出，再访问 /dashboard
- 期望：回到首页
- 结果：通过（Playwright）
- 证据：[截图](../../others/evidence/AC-AUTH-003/2026-11-08.png)
- 未覆盖：后退键场景

<a id="ac-auth-004"></a>

### AC-AUTH-004 认证用例 AC-AUTH-004

- 用例：无会话访问受保护接口
- 期望：401
- 结果：通过（vitest，接口层）
- 证据：[运行日志](../../others/evidence/goal-runs/2026-11-08-07-34.txt)
- 未覆盖：过期会话

<a id="ac-auth-005"></a>

### AC-AUTH-005 认证用例 AC-AUTH-005

- 用例：反复登录，观察限流
- 期望：生产构建下可重复执行
- 结果：通过（Playwright）
- 证据：[截图](../../others/evidence/AC-AUTH-005/2026-11-08.png)
- 未覆盖：限流阈值
