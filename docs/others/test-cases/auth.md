# 测试用例：认证与会话

## 关联规格

- Feature：[`../../features/auth.md`](../../features/auth.md)
- Design：[`../../designs/auth.md`](../../designs/auth.md)

## 用户路径

| 编号 | Given | When | Then | 层级 | 自动化位置 |
| --- | --- | --- | --- | --- | --- |
| AUTH-01 | 未登录用户 | 访问 `/dashboard` | 跳转首页 | E2E | `tests/e2e/auth.spec.ts` |
| AUTH-02 | 新邮箱和合法密码 | 注册 | 创建账户并进入 Dashboard | E2E | `tests/e2e/auth.spec.ts` |
| AUTH-03 | 已登录用户 | 退出登录 | session 失效并回到首页 | E2E | `tests/e2e/auth.spec.ts` |
| AUTH-04 | 已注册用户 | 使用正确凭证登录 | 恢复 session 并进入 Dashboard | E2E | `tests/e2e/auth.spec.ts` |
| AUTH-05 | 生产配置 | 使用 localhost、开发 secret 或 file 数据库 | 启动配置校验失败 | Contract | `tests/contracts/server-env.test.ts` |

## 尚未自动化

本模板不接入真实邮箱；如果项目后续启用邮箱验证，再新增 provider、送达和链接点击用例。
