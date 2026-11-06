# Ignite 功能规格：账本真相核对

## 背景与目标

差异账本的 result 仍停在上一轮快照：P3 与账本维护已交付，但账本里对应条目仍是 missing。账本必须反映真实交付，否则后续判断都会建立在过期数据上。

## 用户行为与边界

| 使用者与条件 | 动作或输入 | 观察结果 | 重要权限或失败边界 | 已有依据 |
| --- | --- | --- | --- | --- |
| 维护者 | 交付完成后刷新账本 | 账本结果与期望值一致即通过 | 不一致时校验失败并指出条目 | 用户 2026-11-06 收尾指令 |

## 模块边界

- 规格：docs/features/spec-closure-truth.md
- 数据：docs/others/spec-closure/ledger.json 与 ledger-expectations.json
- 断言：tests/contracts/spec-closure-ledger-maintenance.test.ts（沿用）

## 业务规则

- R1（REQ-SPEC-010）：账本每条的 result 必须与本轮实际交付一致；met 必须指向真实计划，其余保持 kept/partial/missing。

## 权限、错误与缓存

- 数据归属：只读文档数据。
- 非法输入：集合不一致、met 缺计划，均失败。

## 数据变化与回退

- 既有数据影响：只改 result 与期望集合，不改条目文本。
- 回退：恢复上一版 ledger.json 与期望值即可。

## 原型与交互

- 不适用。

## 非目标

- 不改条目 problem/stage/doc_heading。
- 不新增差距条目。

## 验收标准

- AC-SPEC-010（REQ-SPEC-010）：Given 账本与期望值不一致 When 运行账本校验 Then 失败并指出条目；一致时通过。

## 实现完成后更新

- 设计 docs/designs/execution.md 记录账本刷新规则。
