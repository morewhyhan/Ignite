# Ignite 功能规格：<feature-name>

> 复制本文件到 `docs/features/<feature-name>.md`。新模块默认落在
> `src/modules/<feature-name>/`，服务端契约落在 `src/server/api/`，页面只负责组合。

## 背景与目标

作为 `<actor>`，我想要 `<capability>`，以便 `<value>`。

完善需求前执行 [P1：把任务说准](../standards/execution-focus.md#P1)，根据原始承诺与实际链路确定行为、必要条件和人的决定边界；尺度对照与提示词正文只在该标准维护。

## 模块边界

- 需求类型：增量模块 / 存量修改
- Client module: `src/modules/<feature-name>/`
- Shared UI (only when reused): `src/components/ui/` or `src/components/layout/`
- Server route (when needed): `src/server/api/routes/<feature-name>/`
- Page route: `src/app/<route>/`
- Navigation registration: `src/config/navigation.ts`
- Tests: `tests/api/`, `tests/e2e/`, or `tests/contracts/`

## 字段清单

| 字段 | 类型 | 必填 | 默认值 | 校验规则 | UI 展示 | 数据来源 |
| ---- | ---- | ---- | ------ | -------- | ------- | -------- |

## 业务规则

- R1（REQ-<FEATURE>-001）：每条规则只表达一个可以独立验证的行为。

## 权限、错误与缓存

- 数据归属：个人 / 组织 / 全局共享 / 公开 / 不涉及业务数据；说明选择依据。
- 未登录、无权和 not-found 的响应：
- 非法输入：
- Query key 与失效策略：

## 数据变化与回退

- 既有数据影响：无 / 新增 / 回填转换 / 删除或不可逆变更。
- Migration 与旧数据验证：
- 回退或前向修复方案：
- 破坏性变更授权来源（仅适用时填写）：

## 原型与交互

- 原型链接：
- 模块/页面映射：
- 无外部原型时的设计依据：
- 页面状态：loading / error / empty / pending / success

## 非目标

-

## 验收标准

- AC-<FEATURE>-001（REQ-<FEATURE>-001）：Given ... When ... Then ...

## 实现完成后更新

- `docs/designs/domain.puml`
- `docs/designs/database.sql`
- `docs/designs/api.yaml`
- `docs/designs/sequence.puml`
- 受影响的专题设计
