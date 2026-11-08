# 目标树（开发前的必读根源）

> 这不是项目说明书，也不解释系统全貌。它只声明：目标是什么、由哪几个领域承担、每个领域必须成立哪些规则、每条规则怎么验收。
> 每次开工前先读它；项目现状与实现细节从 [文档入口](docs/README.md) 和 [设计事实](docs/designs/) 进入。
> 写法与链接规则见 [目标树标准](docs/standards/goal-tree.md)。

<!-- goal-status -->
（本块由 pnpm goal:status 生成，勿手改；--run 跑测试并写运行证据，--evidence 登记截图）

| AC | 需求 | 测试 | 状态 | 验证说明 |
| --- | --- | --- | --- | --- |
| AC-AUTH-001 | REQ-AUTH-001 | tests/e2e/auth.spec.ts | 缺截图 | 真实浏览器注册并进入工作台；未覆盖非法邮箱与弱密码 |
| AC-AUTH-002 | REQ-AUTH-001 | tests/e2e/auth.spec.ts | 缺截图 | 真实浏览器登录并建立会话；未覆盖错误密码与锁定 |
| AC-AUTH-004 | REQ-AUTH-004、REQ-AUTH-005 | tests/api/tasks.test.ts | 已验证 | 接口层：无会话访问业务接口返回 401；未覆盖过期会话 |
| AC-AUTH-003 | REQ-AUTH-005 | tests/e2e/auth.spec.ts | 缺截图 | 登出后重访受保护页跳转首页 |
| AC-AUTH-005 | REQ-AUTH-006 | tests/e2e/auth.spec.ts | 缺截图 | 生产构建下认证流程可重复执行；限流阈值未逐一验证 |
| AC-TASKS-001 | REQ-TASKS-001 | tests/e2e/auth.spec.ts | 缺截图 | 浏览器未登录访问工作台被重定向到首页 |
| AC-TASKS-002 | REQ-TASKS-001、REQ-TASKS-002 | tests/e2e/tasks.spec.ts | 缺截图 | 浏览器完成任务的增删改查；未覆盖并发写入 |
| AC-TASKS-003 | REQ-TASKS-001、REQ-TASKS-005 | tests/api/tasks.test.ts | 已验证 | 接口层：访问他人任务返回 404 |
| AC-TASKS-004 | REQ-TASKS-003、REQ-TASKS-004 | tests/api/tasks.test.ts | 已验证 | 接口层：非法输入与未知字段返回 422 |
| AC-TASKS-005 | REQ-TASKS-006 | tests/api/tasks.test.ts | 已验证 | 接口层：列表按 createdAt 倒序断言 |

合计 10 条：缺截图 6，已验证 4
<!-- /goal-status -->
<!-- goal-current -->

当前：未开始（执行者每轮更新：步骤 n/6 · REQ · AC）
<!-- /goal-current -->

## 怎么看这份文档

- 状态表：每条 AC 有没有测试、测到什么程度、验证时间
- goal-current：现在做到第几步、哪条 REQ、哪条 AC
- 其余章节：目标、领域、规则、验收——这是需求的全部

## 目标

> 让一个人从一个想法开始，直接用一套能跑、能验、能继续改的代码做出自己的应用。

## 领域

| 领域 | 管什么                     | 不管什么   | 类型   | 模块                                             | 设计事实                            |
| ---- | -------------------------- | ---------- | ------ | ------------------------------------------------ | ----------------------------------- |
| 认证 | 注册、登录、会话           | 业务数据   | 通用   | `src/modules/auth`                               | [auth.md](docs/designs/auth.md)     |
| 任务 | 任务清单（参考业务）       | 账号、主题 | 支撑   | `src/modules/tasks`                              | [domain.md](docs/designs/domain.md) |
| 外壳 | 落地页、工作台、设置、主题 | 业务规则   | 非领域 | `src/modules/{landing,dashboard,settings,theme}` | [domain.md](docs/designs/domain.md) |

## 规则与验收

### 领域：认证

**REQ-AUTH-001 注册和登录使用邮箱与密码**

- AC-AUTH-001（REQ-AUTH-001）：Given 新用户提交合法邮箱和密码 When 注册 Then 创建账户并进入 Dashboard。
  - 细节：[auth.md](docs/features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts) ｜ 说明：真实浏览器注册并进入工作台；未覆盖非法邮箱与弱密码 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)
- AC-AUTH-002（REQ-AUTH-001）：Given 已注册用户提交正确凭证 When 登录 Then 建立 session 并进入 Dashboard。
  - 细节：[auth.md](docs/features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts) ｜ 说明：真实浏览器登录并建立会话；未覆盖错误密码与锁定 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-AUTH-004 业务 API 只从 session 获取身份**

- AC-AUTH-004（REQ-AUTH-004、REQ-AUTH-005）：Given 没有登录 When 打开需要登录的页面 Then 被带回登录页，看不到任何业务数据
  - 细节：[需求](docs/features/) ｜ 验证：[tests/api/tasks.test.ts](tests/api/tasks.test.ts) ｜ 说明：接口层：无会话访问业务接口返回 401；未覆盖过期会话 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-AUTH-005 登出后不能继续访问受保护页面**

- AC-AUTH-003（REQ-AUTH-005）：Given 用户登出 When 再次访问 `/dashboard` Then 跳转首页。
  - 细节：[auth.md](docs/features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts) ｜ 说明：登出后重访受保护页跳转首页 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-AUTH-006 生产环境开启认证限流**

- AC-AUTH-005（REQ-AUTH-006）：Given 开发、测试或生产环境 When 初始化认证服务 Then 只有真实生产环境启用认证限流，生产构建方式下的隔离 E2E 仍可重复执行。
  - 细节：[需求](docs/features/) ｜ 验证：[tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts) ｜ 说明：生产构建下认证流程可重复执行；限流阈值未逐一验证 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

### 领域：任务

**REQ-TASKS-001 用户只能读取自己的任务**

- AC-TASKS-001（REQ-TASKS-001）：Given 未登录用户 When 访问任务页面 Then 应跳转到首页。
  - 细节：[需求](docs/features/) ｜ 验证：[tests/e2e/auth.spec.ts](tests/e2e/auth.spec.ts) ｜ 说明：浏览器未登录访问工作台被重定向到首页 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)
- AC-TASKS-002（REQ-TASKS-001、REQ-TASKS-002）：Given 已登录用户 When 创建任务 Then 任务只属于当前用户并出现在列表中。
  - 细节：[tasks.md](docs/features/tasks.md) ｜ 验证：[tests/e2e/tasks.spec.ts](tests/e2e/tasks.spec.ts) ｜ 说明：浏览器完成任务的增删改查；未覆盖并发写入 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-TASKS-005 更新或删除非本人任务返回 404**

- AC-TASKS-003（REQ-TASKS-001、REQ-TASKS-005）：Given 用户打开别人的任务链接 When 页面加载 Then 显示“任务不存在”而不是任务内容
  - 细节：[需求](docs/features/) ｜ 验证：[tests/api/tasks.test.ts](tests/api/tasks.test.ts) ｜ 说明：接口层：访问他人任务返回 404 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-TASKS-003 标题非空且不超过 200 字符**

- AC-TASKS-004（REQ-TASKS-003、REQ-TASKS-004）：Given 用户提交空标题或超长标题 When 保存 Then 表单提示错误，任务不保存
  - 细节：[需求](docs/features/) ｜ 验证：[tests/api/tasks.test.ts](tests/api/tasks.test.ts) ｜ 说明：接口层：非法输入与未知字段返回 422 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

**REQ-TASKS-006 列表按 createdAt 倒序**

- AC-TASKS-005（REQ-TASKS-006）：Given 当前用户有多条任务 When 获取列表 Then 任务按 `createdAt` 倒序返回。
  - 细节：[需求](docs/features/) ｜ 验证：[tests/api/tasks.test.ts](tests/api/tasks.test.ts) ｜ 说明：接口层：列表按 createdAt 倒序断言 ｜ 证据：[查看](docs/others/evidence/goal-runs/2026-11-08-07-34.log)

### 领域：外壳（非领域）

工作台只组合认证、任务与设置，不承载业务规则。设计事实见 [domain.md](docs/designs/domain.md)。

## 术语

| 编号      | 术语 | 定义                             |
| --------- | ---- | -------------------------------- |
| TERM-USER | 用户 | 有账号的人，数据归属的唯一依据   |
| TERM-TASK | 任务 | 用户创建的一条待办，有状态与归属 |

## 关系

```text
任务  依赖  认证（任务归属用户）
外壳  组合  认证、任务
```

## 当前不覆盖

```
1. 团队/多租户
2. 消息通知
3. 文件上传
4. 审计日志
```

补进来时新增 REQ；不改上面已有的规则。

## 完成判定

验收标准见 [测试标准](docs/standards/testing.md)；金字塔只声明要什么，不规定怎么验。
