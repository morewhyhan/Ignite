# Plan: 文档系统重组与技术规格补全

## 状态

已完成。该计划记录本轮把原有平铺文档改造成 standards/features/plans/designs/others
体系的过程，不代表未来任务计划。

## 变更类型

- 类型：`[存量改动]`
- 影响的存量路径：原有 `docs/`、README 和 AI 入口文件
- 新增的增量路径：五类文档目录和结构化设计规格
- 兼容性影响：旧文档路径被移除并更新引用
- 数据迁移或回滚要求：无

## 目标

- 按团队级 AI Coding 手册的五类职责重建 `docs/`。
- 将当前 Ignite 的数据库、API、认证、运行时和测试事实写入结构化文档。
- 让 AI 能从需求规格进入计划，再回到当前设计事实。

## 输入规格

- 规则：`AGENTS.md`、`docs/standards/`
- 当前事实：`prisma/schema.prisma`、`src/server/`、`src/modules/`、`tests/`
- 参考切片：`docs/features/tasks.md`

## 实现任务

- [x] 创建 `standards/`、`features/`、`plans/`、`designs/`、`others/`。
- [x] 建立当前领域模型、数据库 DDL、OpenAPI 和 PlantUML 规格。
- [x] 记录认证、运行时环境、请求时序和测试映射。
- [x] 更新 README 和 AGENTS 的文档路由。
- [x] 删除旧的平铺文档路径引用。

## 验收方式

- [x] `pnpm format`
- [x] `pnpm check`
- [x] `git diff --check`
- [x] 检查旧文档路径无残留。

## 状态记录

| 时间       | 状态   | 说明                               |
| ---------- | ------ | ---------------------------------- |
| 2026-07-26 | 已完成 | 建立五类文档体系并通过当时适用检查 |

## 准出条件

- [x] 文档目录职责与手册一致。
- [x] 当时适用检查通过。
- [x] 设计事实与文档入口已更新。

## 最终产物

- 当前设计真源位于 `docs/designs/`，实现真源仍是源码和配置。
- 未来新业务从 `docs/features/` 创建需求，再在 `docs/plans/` 创建一次性计划。
