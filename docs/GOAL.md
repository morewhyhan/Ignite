# 目标树（需求真源）

一份文档说清要什么、做到哪。开头是介绍与边界，中间是图，下面是逐级的文字金字塔。

## 一、这份文档是什么

整套文档的唯一入口，也是人和 Agent 之间的接口。

**它管什么**：目标是什么、由哪几个领域承担、每个领域必须成立哪些规则、每条规则怎么验收。
不管系统长什么样（那是 [设计事实](designs/)），也不管怎么写（那是 [工程标准](standards/)）。

**五级结构**：

```
第 1 级  目标        这套软件最终让人完成什么
第 2 级  领域        一块业务边界
第 3 级  REQ         这个边界里必须成立的规则
第 4 级  AC          用户做什么、看到什么
第 5 级  测试用例    怎么证明这条 AC 成立（结果 + 证据）
```

**人怎么用**：只改目标、领域、REQ、AC；改完跑 `pnpm goal:audit --record "结论"`。
**Agent 怎么用**：每轮从这里读起，把结果和证据写回每条 AC 下面的用例行。

**为什么要有它**：Agent 做长任务会偏移。这份文档把目标、规则、验收、证据串成一条线，
让它每一轮都能回到“要什么、做到哪”。代价是它不拦人：偏移会留下痕迹，但不阻止偏移。

**状态含义**：

| 状态       | 意思                               |
| ---------- | ---------------------------------- |
| 缺测试     | 没有测试文件提到这条 AC            |
| 测试缺编号 | 有文件，但测试标题没有 `[AC-编号]` |
| 有测试     | 有测试，还没跑或没证据             |
| 已验证     | 测试通过，或浏览器类 AC 已有截图   |
| 缺证据     | 有测试，但没有运行日志或截图       |
| 缺截图     | 浏览器类 AC 只有日志               |
| 失败       | 最近一次运行失败                   |

**术语**：

| 编号      | 术语 | 定义                             |
| --------- | ---- | -------------------------------- |
| TERM-USER | 用户 | 有账号的人，数据归属的唯一依据   |
| TERM-TASK | 任务 | 用户创建的一条待办，有状态与归属 |

**当前不覆盖**：

```
1. 团队/多租户
2. 消息通知
3. 文件上传
4. 审计日志
```

补进来时新增 REQ；不改上面已有的规则。

## 二、金字塔（图）

```mermaid
flowchart LR
  G["目标：做出能跑、能验、能继续改的应用"]
  G --> D1["认证领域"]
  G --> D2["任务领域"]
  D1 --> R1["REQ-AUTH-001"]
  D1 --> R4["REQ-AUTH-004"]
  D1 --> R5["REQ-AUTH-005"]
  D1 --> R6["REQ-AUTH-006"]
  D2 --> T1["REQ-TASKS-001"]
  D2 --> T3["REQ-TASKS-003"]
  D2 --> T5["REQ-TASKS-005"]
  D2 --> T6["REQ-TASKS-006"]
  R1 --> A1["AC-AUTH-001"]
  R1 --> A2["AC-AUTH-002"]
  R4 --> A4["AC-AUTH-004"]
  R5 --> A3["AC-AUTH-003"]
  R6 --> A5["AC-AUTH-005"]
  T1 --> AT1["AC-TASKS-001"]
  T1 --> AT2["AC-TASKS-002"]
  T3 --> AT4["AC-TASKS-004"]
  T5 --> AT3["AC-TASKS-003"]
  T6 --> AT5["AC-TASKS-005"]
  A1 --> U1["用例：注册"]
  A2 --> U2["用例：登录"]
  A3 --> U3["用例：登出"]
  A4 --> U4["用例：未登录"]
  A5 --> U5["用例：限流"]
  AT1 --> V1["用例：未登录访问"]
  AT2 --> V2["用例：增删改查"]
  AT3 --> V3["用例：他人任务"]
  AT4 --> V4["用例：非法输入"]
  AT5 --> V5["用例：排序"]
```

> 外壳是非领域，只承担路由与布局，不进入金字塔；它的设计见 [designs](designs/)。

## 三、金字塔（文字）

<!-- goal-summary -->
合计 10 条：已验证 10
<!-- /goal-summary -->

- **目标**：让一个人从一个想法开始，直接用一套能跑、能验、能继续改的代码做出自己的应用。

  - **认证领域**（支撑子域）
    - 事件链：注册 → 登录 → 会话 → 登出
    - 聚合：用户、会话（会话必须属于一个存在的用户；删除用户时会话一起失效）
    - 边界：管身份与会话；不管权限分级、团队成员、找回密码
    - 为什么这样切：账号与会话是同一条事件链、生命周期一致，合并为一个领域；权限分级没有多角色需求，砍掉
    - 术语：用户 = 有账号的人；会话 = 一次登录的凭证
    - **REQ-AUTH-001 注册和登录使用邮箱与密码**
      - 来源事件：注册、登录
      - 规则：邮箱密码合法才建立会话，否则拒绝并提示
      - AC-AUTH-001（REQ-AUTH-001）：Given 新用户提交合法邮箱和密码 When 注册 Then 创建账户并进入 Dashboard。
        - **测试用例**：新用户首次注册 → 能进入工作台开始用 ｜ **状态**：已验证 ｜ [用例](others/test-cases/auth.md#ac-auth-001) · [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) · [查看](others/evidence/AC-AUTH-001/2026-11-08.png)
      - AC-AUTH-002（REQ-AUTH-001）：Given 已注册用户提交正确凭证 When 登录 Then 建立 session 并进入 Dashboard。
        - **测试用例**：老用户登录 → 进入自己的工作台 ｜ **状态**：已验证 ｜ [用例](others/test-cases/auth.md#ac-auth-002) · [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) · [查看](others/evidence/AC-AUTH-002/2026-11-08.png)
    - **REQ-AUTH-004 业务 API 只从 session 获取身份**
      - 来源事件：打开需要登录的页面、调用受保护接口
      - 规则：身份只从 session 取，不信任客户端传入的 userId；没有会话就不能读业务数据
      - AC-AUTH-004（REQ-AUTH-004、REQ-AUTH-005）：Given 没有登录 When 打开需要登录的页面 Then 被带回登录页，看不到任何业务数据
        - **测试用例**：未登录直接打开受保护页 → 被带回登录页 ｜ **状态**：已验证 ｜ [用例](others/test-cases/auth.md#ac-auth-004) · [tests/api/tasks.test.ts](../tests/api/tasks.test.ts) · [查看](others/evidence/goal-runs/2026-11-08-07-34.txt)
    - **REQ-AUTH-005 登出后不能继续访问受保护页面**
      - 来源事件：登出
      - 规则：登出后旧会话失效，受保护页面与接口都不可再访问
      - AC-AUTH-003（REQ-AUTH-005）：Given 用户登出 When 再次访问 `/dashboard` Then 跳转首页。
        - **测试用例**：用户登出后按后退键 → 仍停在首页 ｜ **状态**：已验证 ｜ [用例](others/test-cases/auth.md#ac-auth-003) · [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) · [查看](others/evidence/AC-AUTH-003/2026-11-08.png)
    - **REQ-AUTH-006 生产环境开启认证限流**
      - 来源事件：登录
      - 规则：只有真实生产环境启用认证限流，开发与测试环境关闭；生产构建方式下的隔离 E2E 仍可重复执行
      - AC-AUTH-005（REQ-AUTH-006）：Given 开发、测试或生产环境 When 初始化认证服务 Then 只有真实生产环境启用认证限流，生产构建方式下的隔离 E2E 仍可重复执行。
        - **测试用例**：生产环境反复登录 → 认证流程正常且可重复 ｜ **状态**：已验证 ｜ [用例](others/test-cases/auth.md#ac-auth-005) · [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) · [查看](others/evidence/AC-AUTH-005/2026-11-08.png)
  - **任务领域**（支撑子域）
    - 事件链：创建 → 查看 → 编辑 → 完成 → 删除
    - 聚合：任务（任务必须属于一个用户；删除用户时任务一并失效）
    - 边界：管归属、校验、排序；不管标签、提醒、统计
    - 为什么这样切：任务有自己的实体与生命周期，和身份是两套规则，硬合并会让归属校验和会话校验互相污染
    - 术语：任务 = 一条待办，有标题、状态、归属；所有者 = 任务所属的账号
    - **REQ-TASKS-001 用户只能读取自己的任务**
      - 来源事件：打开任务页、创建任务
      - 规则：未登录不能访问任务页；任务只属于创建它的用户
      - AC-TASKS-001（REQ-TASKS-001）：Given 未登录用户 When 访问任务页面 Then 应跳转到首页。
        - **测试用例**：未登录访问工作台 → 被带回首页 ｜ **状态**：已验证 ｜ [用例](others/test-cases/tasks.md#ac-tasks-001) · [tests/e2e/auth.spec.ts](../tests/e2e/auth.spec.ts) · [查看](others/evidence/AC-TASKS-001/2026-11-08.png)
      - AC-TASKS-002（REQ-TASKS-001、REQ-TASKS-002）：Given 已登录用户 When 创建任务 Then 任务只属于当前用户并出现在列表中。
        - **测试用例**：登录用户增删改查任务 → 列表立即反映结果 ｜ **状态**：已验证 ｜ [用例](others/test-cases/tasks.md#ac-tasks-002) · [tests/e2e/tasks.spec.ts](../tests/e2e/tasks.spec.ts) · [查看](others/evidence/AC-TASKS-002/2026-11-08.png)
    - **REQ-TASKS-005 更新或删除非本人任务返回 404**
      - 来源事件：打开他人任务链接、调用他人任务接口
      - 规则：非本人任务一律按不存在处理，不泄露它是否存在
      - AC-TASKS-003（REQ-TASKS-001、REQ-TASKS-005）：Given 用户打开别人的任务链接 When 页面加载 Then 显示“任务不存在”而不是任务内容
        - **测试用例**：用户打开别人的任务链接 → 显示任务不存在 ｜ **状态**：已验证 ｜ [用例](others/test-cases/tasks.md#ac-tasks-003) · [tests/api/tasks.test.ts](../tests/api/tasks.test.ts) · [查看](others/evidence/goal-runs/2026-11-08-07-34.txt)
    - **REQ-TASKS-003 标题非空且不超过 200 字符**
      - 来源事件：提交任务表单、编辑任务
      - 规则：标题为空或超过 200 字符时拒绝保存，并提示用户
      - AC-TASKS-004（REQ-TASKS-003、REQ-TASKS-004）：Given 用户提交空标题或超长标题 When 保存 Then 表单提示错误，任务不保存
        - **测试用例**：用户提交空标题或超长标题 → 表单提示错误且不保存 ｜ **状态**：已验证 ｜ [用例](others/test-cases/tasks.md#ac-tasks-004) · [tests/api/tasks.test.ts](../tests/api/tasks.test.ts) · [查看](others/evidence/goal-runs/2026-11-08-07-34.txt)
    - **REQ-TASKS-006 列表按 createdAt 倒序**
      - 来源事件：获取任务列表
      - 规则：列表按创建时间倒序返回，最新创建的排在最前
      - AC-TASKS-005（REQ-TASKS-006）：Given 当前用户有多条任务 When 获取列表 Then 任务按 `createdAt` 倒序返回。
        - **测试用例**：用户有多条任务 → 最新任务排在最前 ｜ **状态**：已验证 ｜ [用例](others/test-cases/tasks.md#ac-tasks-005) · [tests/api/tasks.test.ts](../tests/api/tasks.test.ts) · [查看](others/evidence/goal-runs/2026-11-08-07-34.txt)
  - **外壳（非领域）**
**关系**：

```text
任务  依赖  认证（任务归属用户）
外壳  组合  认证、任务
```

**完成判定**：验收标准见 [测试标准](standards/testing.md)；金字塔只声明要什么，不规定怎么验。
