# 测试用例：Tasks

## 关联规格

- Feature：[`../../features/tasks.md`](../../features/tasks.md)
- API：[`../../designs/api.md`](../../designs/api.md)

## 用户路径

| 编号    | Given         | When                   | Then                   | 层级 | 自动化位置                |
| ------- | ------------- | ---------------------- | ---------------------- | ---- | ------------------------- |
| TASK-01 | 无 Session    | 请求任务 API           | 返回 `401`             | API  | `tests/api/tasks.test.ts` |
| TASK-02 | 已登录用户    | 提交空标题或未知字段   | 返回 `422` 且不写入    | API  | `tests/api/tasks.test.ts` |
| TASK-03 | 用户 A 的任务 | 用户 B 尝试更新        | 返回 `404` 且数据不变  | API  | `tests/api/tasks.test.ts` |
| TASK-04 | 已登录用户    | 创建、查询、更新、删除 | 所有操作只影响本人数据 | API  | `tests/api/tasks.test.ts` |
| TASK-05 | 已登录用户    | 完成页面 CRUD          | 页面和缓存状态一致     | E2E  | `tests/e2e/tasks.spec.ts` |
