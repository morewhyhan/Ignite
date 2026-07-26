# 测试用例规范

这里记录验收意图；真正可执行的测试位于 `tests/`。稳定路径应固化为自动化测试。

## 当前用例

- [`auth.md`](./auth.md)：认证、会话和路由守卫
- [`tasks.md`](./tasks.md)：任务 API 和用户流程

## 自动化映射

| 用例                                  | 实现位置                      |
| ------------------------------------- | ----------------------------- |
| 任务 API 鉴权、校验、跨用户隔离、CRUD | `tests/api/tasks.test.ts`     |
| 环境和 Better Auth schema 规则        | `tests/contracts/`            |
| 注册、登录、登出和路由守卫            | `tests/e2e/auth.spec.ts`      |
| 任务页面完整流程                      | `tests/e2e/tasks.spec.ts`     |
| Migration 干净部署与 drift            | `scripts/test-migrations.mjs` |
