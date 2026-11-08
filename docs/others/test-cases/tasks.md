# 测试用例：Tasks

## 关联规格

- Feature：[`../../features/tasks.md`](../../features/tasks.md)
- API：[`../../designs/api.md`](../../designs/api.md)

## 用户路径

| 验收标准     | Given         | When                   | Then                   | 层级 | 自动化位置                |
| ------------ | ------------- | ---------------------- | ---------------------- | ---- | ------------------------- |
| AC-AUTH-004  | 无 Session    | 请求任务 API           | 返回 `401`             | API  | `tests/api/tasks.test.ts` |
| AC-TASKS-004 | 已登录用户    | 提交空标题或未知字段   | 返回 `422` 且不写入    | API  | `tests/api/tasks.test.ts` |
| AC-TASKS-003 | 用户 A 的任务 | 用户 B 尝试更新或删除  | 返回 `404` 且数据不变  | API  | `tests/api/tasks.test.ts` |
| AC-TASKS-002 | 已登录用户    | 创建、查询、更新、删除 | 所有操作只影响本人数据 | API  | `tests/api/tasks.test.ts` |
| AC-TASKS-005 | 多条本人任务  | 获取列表               | 按创建时间倒序         | API  | `tests/api/tasks.test.ts` |
| AC-TASKS-001 | 未登录用户    | 访问 Tasks 页面        | 跳转首页               | E2E  | `tests/e2e/auth.spec.ts`  |

## 结论记录

<a id="ac-tasks-001"></a>

### AC-TASKS-001 任务用例 AC-TASKS-001

- 用例：未登录访问工作台
- 期望：跳转首页
- 结果：通过（Playwright）
- 证据：[截图](../../others/evidence/AC-TASKS-001/2026-11-08.png)
- 未覆盖：直接调接口

<a id="ac-tasks-002"></a>

### AC-TASKS-002 任务用例 AC-TASKS-002

- 用例：登录后增删改查任务
- 期望：列表即时反映结果
- 结果：通过（Playwright）
- 证据：[截图](../../others/evidence/AC-TASKS-002/2026-11-08.png)
- 未覆盖：并发写入

<a id="ac-tasks-003"></a>

### AC-TASKS-003 任务用例 AC-TASKS-003

- 用例：访问他人任务
- 期望：任务不存在
- 结果：通过（vitest，接口层）
- 证据：[运行日志](../../others/evidence/goal-runs/2026-11-08-07-34.txt)
- 未覆盖：无

<a id="ac-tasks-004"></a>

### AC-TASKS-004 任务用例 AC-TASKS-004

- 用例：提交非法输入
- 期望：拒绝并提示
- 结果：通过（vitest，接口层）
- 证据：[运行日志](../../others/evidence/goal-runs/2026-11-08-07-34.txt)
- 未覆盖：无

<a id="ac-tasks-005"></a>

### AC-TASKS-005 任务用例 AC-TASKS-005

- 用例：查看任务列表
- 期望：最新在前
- 结果：通过（vitest，接口层）
- 证据：[运行日志](../../others/evidence/goal-runs/2026-11-08-07-34.txt)
- 未覆盖：无
