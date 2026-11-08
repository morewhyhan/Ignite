# 目标树（需求真源 + 状态看板）

## 这是什么

整套文档的唯一入口。它把需求拆成四层，每层只回答一个问题：

    目标  这套软件最终让人完成什么
    领域  一块业务边界：管什么、不管什么
    REQ   这条边界里一条必须成立的规则
    AC    用户做什么、看到什么（测试挂在它下面）

它不管系统长什么样——那是 [设计事实](designs/)；它也不管怎么写——那是 [工程标准](standards/)。
它只回答两件事：要什么、做到没有。

## 它为什么存在

Agent 做长任务会偏移：开头记得目标，做到一半被细节带走。这份文档把目标、规则、验收、证据串成一条线，
让 Agent 每一轮都从根读起，随时能回到“我们到底要什么、现在做到哪”。

它替代的是两种失败做法：把规格散在五层文档里（执行时忘了），和用强制脚本卡每一步（效率太低）。
代价是它不拦人——偏移会留下痕迹，但不阻止偏移。

## 它在流程里的位置

```
人在这里写清目标、领域、REQ、AC
   ↓ Agent 读取并展开
五层文档（features / designs / standards / others）与代码
   ↓ 验证
测试通过或截图 → 证据回链到对应 AC
   ↓
人回到这里，一眼看到做到哪、验证到什么程度
```

这份文档就是人和 Agent 之间的接口：人只改这里，Agent 把结果写回这里。

## 谁怎么写

| 角色 | 做什么                                                                            |
| ---- | --------------------------------------------------------------------------------- |
| 人   | 改目标、领域、REQ、AC；改完跑 `pnpm goal:audit --record "结论"`                   |
| AI   | 每轮先读这里，再点开 AC 链接的 Feature 与 Design；收尾跑 `pnpm goal:status --run` |
| 脚本 | 维护状态表与 goal-current，不许手改                                               |

## 怎么看

| 看什么       | 在哪                                       |
| ------------ | ------------------------------------------ |
| 做到哪了     | 顶部状态表：每条 AC 的测试、状态、验证说明 |
| 正在做什么   | goal-current：步骤、REQ、AC                |
| 还差什么     | 状态表里的 缺测试 / 缺证据 / 缺截图 / 失败 |
| 为什么这么定 | 这条 AC 链接的 Feature 与 Design           |

## 状态含义

| 状态       | 意思                               |
| ---------- | ---------------------------------- |
| 缺测试     | 没有测试文件提到这条 AC            |
| 测试缺编号 | 有文件，但测试标题没有 `[AC-编号]` |
| 有测试     | 有测试，还没跑或没证据             |
| 已验证     | 测试通过，或浏览器类 AC 已有截图   |
| 缺证据     | 有测试，但没有运行日志或截图       |
| 缺截图     | 浏览器类 AC 只有日志               |
| 失败       | 最近一次运行失败                   |

## 目标

> 让一个人从一个想法开始，直接用一套能跑、能验、能继续改的代码做出自己的应用。

## 领域

| 领域 | 管什么                     | 不管什么   | 类型   | 模块                                             | 设计事实                       |
| ---- | -------------------------- | ---------- | ------ | ------------------------------------------------ | ------------------------------ |
| 认证 | 注册、登录、会话           | 业务数据   | 通用   | `src/modules/auth`                               | [auth.md](designs/auth.md)     |
| 任务 | 任务清单（参考业务）       | 账号、主题 | 支撑   | `src/modules/tasks`                              | [domain.md](designs/domain.md) |
| 外壳 | 落地页、工作台、设置、主题 | 业务规则   | 非领域 | `src/modules/{landing,dashboard,settings,theme}` | [domain.md](designs/domain.md) |

## 规则与验收

### 领域：认证

**REQ-AUTH-001 注册和登录使用邮箱与密码**

- AC-AUTH-001（REQ-AUTH-001）：Given 新用户提交合法邮箱和密码 When 注册 Then 创建账户并进入 Dashboard。
  - 细节：[auth.md](features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) ｜ 说明：场景：新用户首次注册；通过：能进入工作台开始用；不过：新用户无法使用产品；未覆盖：非法邮箱与弱密码 ｜ 证据：[查看](others/evidence/AC-AUTH-001/2026-11-08.png)
- AC-AUTH-002（REQ-AUTH-001）：Given 已注册用户提交正确凭证 When 登录 Then 建立 session 并进入 Dashboard。
  - 细节：[auth.md](features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) ｜ 说明：场景：老用户登录；通过：进入自己的工作台；不过：老用户回不到自己的数据；未覆盖：错误密码与账号锁定 ｜ 证据：[查看](others/evidence/AC-AUTH-002/2026-11-08.png)

**REQ-AUTH-004 业务 API 只从 session 获取身份**

- AC-AUTH-004（REQ-AUTH-004、REQ-AUTH-005）：Given 没有登录 When 打开需要登录的页面 Then 被带回登录页，看不到任何业务数据
  - 细节：[需求](features/) ｜ 验证：[tests/api/tasks.test.ts](../tests/api/tasks.test.ts) ｜ 说明：场景：未登录直接打开受保护页；通过：被带回登录页；不过：未登录的人能看到业务数据；未覆盖：会话过期 ｜ 证据：[查看](others/evidence/goal-runs/2026-11-08-07-34.txt)

**REQ-AUTH-005 登出后不能继续访问受保护页面**

- AC-AUTH-003（REQ-AUTH-005）：Given 用户登出 When 再次访问 `/dashboard` Then 跳转首页。
  - 细节：[auth.md](features/auth.md) ｜ 验证：[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) ｜ 说明：场景：用户登出后按后退键；通过：仍停在首页；不过：登出后还能看到上个账号的页面 ｜ 证据：[查看](others/evidence/AC-AUTH-003/2026-11-08.png)；未覆盖：无

**REQ-AUTH-006 生产环境开启认证限流**

- AC-AUTH-005（REQ-AUTH-006）：Given 开发、测试或生产环境 When 初始化认证服务 Then 只有真实生产环境启用认证限流，生产构建方式下的隔离 E2E 仍可重复执行。
  - 细节：[需求](features/) ｜ 验证：[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) ｜ 说明：场景：生产环境反复登录；通过：认证流程正常且可重复；不过：生产限流配置错误导致登录被拒或形同虚设；未覆盖：限流阈值 ｜ 证据：[查看](others/evidence/AC-AUTH-005/2026-11-08.png)

### 领域：任务

**REQ-TASKS-001 用户只能读取自己的任务**

- AC-TASKS-001（REQ-TASKS-001）：Given 未登录用户 When 访问任务页面 Then 应跳转到首页。
  - 细节：[需求](features/) ｜ 验证：[tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) ｜ 说明：场景：未登录访问工作台；通过：被带回首页；不过：未登录能看到任务页壳；未覆盖：直接调接口 ｜ 证据：[查看](others/evidence/AC-TASKS-001/2026-11-08.png)
- AC-TASKS-002（REQ-TASKS-001、REQ-TASKS-002）：Given 已登录用户 When 创建任务 Then 任务只属于当前用户并出现在列表中。
  - 细节：[tasks.md](features/tasks.md) ｜ 验证：[tests/e2e/tasks.spec.ts](../tests/e2e/tasks.spec.ts) ｜ 说明：场景：登录用户增删改查任务；通过：列表立即反映结果；不过：创建失败或看到别人的任务；未覆盖：并发写入 ｜ 证据：[查看](others/evidence/AC-TASKS-002/2026-11-08.png)

**REQ-TASKS-005 更新或删除非本人任务返回 404**

- AC-TASKS-003（REQ-TASKS-001、REQ-TASKS-005）：Given 用户打开别人的任务链接 When 页面加载 Then 显示“任务不存在”而不是任务内容
  - 细节：[需求](features/) ｜ 验证：[tests/api/tasks.test.ts](../tests/api/tasks.test.ts) ｜ 说明：场景：用户打开别人的任务链接；通过：显示任务不存在；不过：能看到别人的任务内容 ｜ 证据：[查看](others/evidence/goal-runs/2026-11-08-07-34.txt)；未覆盖：无

**REQ-TASKS-003 标题非空且不超过 200 字符**

- AC-TASKS-004（REQ-TASKS-003、REQ-TASKS-004）：Given 用户提交空标题或超长标题 When 保存 Then 表单提示错误，任务不保存
  - 细节：[需求](features/) ｜ 验证：[tests/api/tasks.test.ts](../tests/api/tasks.test.ts) ｜ 说明：场景：用户提交空标题或超长标题；通过：表单提示错误且不保存；不过：脏数据进入列表 ｜ 证据：[查看](others/evidence/goal-runs/2026-11-08-07-34.txt)；未覆盖：无

**REQ-TASKS-006 列表按 createdAt 倒序**

- AC-TASKS-005（REQ-TASKS-006）：Given 当前用户有多条任务 When 获取列表 Then 任务按 `createdAt` 倒序返回。
  - 细节：[需求](features/) ｜ 验证：[tests/api/tasks.test.ts](../tests/api/tasks.test.ts) ｜ 说明：场景：用户有多条任务；通过：最新任务排在最前；不过：新任务沉底，用户以为没创建成功 ｜ 证据：[查看](others/evidence/goal-runs/2026-11-08-07-34.txt)；未覆盖：无

### 领域：外壳（非领域）

工作台只组合认证、任务与设置，不承载业务规则。设计事实见 [domain.md](designs/domain.md)。

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

验收标准见 [测试标准](standards/testing.md)；金字塔只声明要什么，不规定怎么验。
