# Ignite 功能规格：认证与会话

## 背景与目标

Ignite 提供自包含的邮箱密码注册、登录、登出和会话恢复能力，使任务数据按用户隔离。模板基线不接入真实邮箱、验证码或外部邮件服务；需要邮箱所有权验证的项目应新增独立规格和实现计划。

## 模块边界

- Client module: `src/modules/auth/`
- Auth client: `src/modules/auth/lib/auth-client.ts`
- Server auth: `src/server/auth/`
- Auth route adapter: `src/app/api/[[...route]]/route.ts`
- Contract tests: `tests/contracts/auth-schema.test.ts`

## 字段清单

| 字段       | 类型   | 必填     | 校验          | 数据来源    |
| ---------- | ------ | -------- | ------------- | ----------- |
| `name`     | string | 注册必填 | 非空          | 用户输入    |
| `email`    | email  | 是       | 合法邮箱      | 用户输入    |
| `password` | string | 是       | 8–128 字符    | 用户输入    |
| `session`  | cookie | 登录后   | HttpOnly 会话 | Better Auth |

Better Auth schema 中保留的 `emailVerified` 和 `verification` 表属于兼容性预留，不代表模板会发送验证邮件。

## 业务规则

- R1：注册和登录使用邮箱与密码。
- R2：密码长度为 8–128 个字符。
- R3：注册、登录不要求外部邮箱验证。
- R4：业务 API 只能从 session 获取用户身份，不能信任客户端传入的 `userId`。
- R5：登出后访问受保护页面跳转首页，受保护 API 返回 `401`。

## 验收标准

- Given 新用户提交合法邮箱和密码，When 注册，Then 创建账户并进入 Dashboard。
- Given 已注册用户提交正确凭证，When 登录，Then 建立 session 并进入 Dashboard。
- Given 用户登出，When 再次访问 `/dashboard`，Then 跳转首页。
- Given 没有 session，When 访问受保护业务 API，Then 返回 `401`。

## 实现映射

- Better Auth 配置：`src/server/auth/index.ts`
- 客户端认证封装：`src/modules/auth/lib/auth-client.ts`
- 认证 UI：`src/modules/auth/components/auth-modal.tsx`
- 环境约束：`src/server/env.ts`
- E2E：`tests/e2e/auth.spec.ts`
- 详细设计：[`../designs/auth.md`](../designs/auth.md)
