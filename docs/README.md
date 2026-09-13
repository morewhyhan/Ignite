# 文档系统

Ignite 的文档服务于“模板基线 + 后续项目扩展”：AI 应先把本仓库当作模板理解，再根据具体项目需求新增或替换功能规格。`tasks`、认证和当前视觉系统是模板自带基线，不应在没有明确要求时被删除或重命名。

每个任务先标记变更类型：`[新增模块]` 或 `[存量改动]`。新增能力建立独立模块；修改现有能力或基础设施必须列出影响路径、兼容性、迁移和回归测试，风险强度另由 Plan 的 `risk` 表达。

本目录按“标准、需求、计划、设计、其他资料”组织。文档只描述规则、规格、
计划或系统事实；代码、`package.json`、Prisma schema 和测试仍是实现真源。

## 目录职责

| 目录         | 内容                                    | 维护方式                               |
| ------------ | --------------------------------------- | -------------------------------------- |
| `standards/` | 架构、API、数据库、命名、安全和开发标准 | 稳定规则，变更时更新最终版本           |
| `features/`  | 一个业务模块一份需求规格                | 产品/业务起点，按功能新增              |
| `plans/`     | 当前任务的实现计划、Tasking 和状态      | 每轮新增文件，完成后保留，不回写旧计划 |
| `designs/`   | 当前数据库、API 和系统设计事实          | 持续更新，作为下一轮工作的事实依据     |
| `others/`    | ADR、测试用例、发布记录等过程资料       | 追加记录，不混入标准或当前事实         |

## 执行入口

新任务先从 [`docs/plans/_template.md`](./plans/_template.md) 创建一个结构化 Plan，并分配稳定的 `IGT-*` ID；当前发布范围写在 [`plans/releases/`](./plans/releases/) 的 JSON 机器源里。日常只需要记住三个入口：

```text
pnpm ignite plan validate <IGT-ID>       # 检查 Plan 元数据
pnpm ignite status --write                # 汇总当前 Plan 与发布范围
pnpm ignite check --plan <IGT-ID> --level auto
```

活动状态和完整日志保存在 Git 忽略的 `.ignite/runs/`；只有通过的检查会把脱敏 manifest 写入 `docs/others/evidence/runs/`。同一输入与环境已有运行时 CLI 会复用；状态摘要和 Release 状态都是派生结果，不维护第二份手工状态。历史 Plan 保留原文并标记为未验证，不因新规则自动变成已完成。

## 变更流转

```text
features/  →  plans/  →  tests + code  →  designs/
                         ↓
                      others/
standards/ ───────────────┘ 约束整个过程
```

规范性规则以仓库根目录的 [`AGENTS.md`](../AGENTS.md) 为准。

## 真源与冲突处理

| 内容                     | 权威来源                                    |
| ------------------------ | ------------------------------------------- |
| AI 行为和长期规则        | `AGENTS.md`、`docs/standards/`              |
| 产品意图和验收标准       | `docs/features/`                            |
| 本轮过程、状态和验证证据 | `docs/plans/`                               |
| 当前设计契约             | `docs/designs/`                             |
| 可执行实现               | `src/`、`prisma/`、`tests/`、`package.json` |

`docs/designs/` 是下一轮 Plan 的设计事实依据；源码和测试是当前可执行行为。两者冲突不是选择一个忽略另一个，而是一次未完成的变更：任务范围内必须同步修正或在 Plan 中记录差异。

首次把模板采用为具体项目时，从 [`standards/adoption.md`](./standards/adoption.md) 开始。
