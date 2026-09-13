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
