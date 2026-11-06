# Ignite 功能规格：账本真相证据

## 背景与目标

账本的 met 目前只需与期望值文件一致即可，无法证明"确实交付"。本规格要求每条 met 附带可核验来源（计划与发布），使账本从"自洽"变成"可证"。

## 用户行为与边界

| 使用者与条件 | 动作或输入 | 观察结果 | 重要权限或失败边界 | 已有依据 |
| --- | --- | --- | --- | --- |
| 维护者 | 标记某条为 met | 必须给出计划与发布来源 | 缺失或指向不存在对象即失败 | 用户 2026-11-06 收尾指令 |

## 模块边界

- 规格：docs/features/spec-closure-truth.md
- 数据：docs/others/spec-closure/ledger.json 与 ledger-expectations.json（metEvidence）
- 断言：tests/contracts/spec-closure-ledger-truth.test.ts

## 业务规则

- R1（REQ-SPEC-010）：每条 met 必须在 metEvidence 中给出 plan 与 release；plan 必须存在于 docs/plans，release 必须存在于 docs/plans/releases。

## 权限、错误与缓存

- 数据归属：只读文档数据。
- 非法输入：met 缺证据、证据指向不存在对象，均失败。

## 数据变化与回退

- 既有数据影响：为现有 5 条 met 补证据，不改条目文本。
- 回退：移除 metEvidence 并恢复测试即可。

## 原型与交互

- 不适用。

## 非目标

- 不判定条目内容是否"真的做完"，只核验证据指向。
- 不改已有维护测试。

## 验收标准

- AC-SPEC-010（REQ-SPEC-010）：Given 某条 met 缺 metEvidence 或指向不存在的计划/发布 When 运行真相校验 Then 失败并指出条目；全部可核验时通过。

## 实现完成后更新

- docs/designs/execution.md 记录 metEvidence 规则。
