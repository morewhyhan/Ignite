# 移除外部邮箱验证依赖

## 状态

已完成。

## 变更类型

- 类型：`[基础设施变更]`

## 目标

让模板认证保持自包含的邮箱密码注册/登录，不要求真实邮箱、验证码、Resend 或其他外部邮件 provider。

## 输入规格

- 当前认证实现：`src/server/auth/index.ts`、`src/modules/auth/`
- 环境契约：`src/server/env.ts`、`.env.example`
- 认证规格：`docs/features/auth.md`
- 认证设计：`docs/designs/auth.md`

## 实现任务

- [x] 删除 Resend 邮件 adapter 和相关环境变量。
- [x] 关闭 Better Auth 的邮箱验证强制要求，保留普通邮箱密码认证。
- [x] 删除前端等待验证邮件的分支和提示。
- [x] 更新 README、AI 规则、规格、设计、安全和验收文档。
- [x] 说明 Better Auth verification 表仅作为 schema 兼容性预留。

## 验收方式

- `pnpm docs:check`
- `pnpm check`
- `pnpm test:migrations`
- `pnpm build`
- `pnpm test:e2e`
- 全仓搜索不再出现 Resend 或邮箱验证配置。

## 状态记录

- 2026-07-26：移除真实邮件发送链路；后续若需要邮箱所有权验证，必须单独建立增量 Feature/Plan。

## 准出条件

- [x] 代码、环境、文档和测试契约一致。
- [x] 本地注册成功后直接进入 Dashboard。
- [x] 生产配置只校验 HTTPS、secret 和持久数据库，不绑定邮件 provider。
