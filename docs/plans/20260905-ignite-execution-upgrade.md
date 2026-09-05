<!-- ignite-plan
{
  "schema": 1,
  "id": "IGT-001",
  "release": "ignite-execution-v1",
  "status": "active",
  "outcome": "AI 可以在同一份 Plan 内完成一个功能切片、按风险验证、恢复中断并交付带证据的结果",
  "change_type": "基础设施变更",
  "requirements": [
    "REQ-TASK-UNIT",
    "REQ-STATE-ENTRY",
    "REQ-RISK-CHECK",
    "REQ-EVIDENCE",
    "REQ-RECOVERY",
    "REQ-SAMPLE-REPLAY"
  ],
  "depends_on": [],
  "owner": "template-maintainer",
  "risk": "workflow-infrastructure",
  "write_scope": [
    "AGENTS.md",
    "docs/standards/workflow.md",
    "docs/standards/testing.md",
    "docs/features/_template.md",
    "docs/plans/_template.md",
    "docs/plans/releases/",
    "docs/others/evidence/",
    "scripts/ignite.mjs",
    "scripts/create-module.mjs",
    "scripts/check-docs.mjs",
    "package.json",
    "tests/contracts/ignite-cli.test.ts"
  ],
  "required_evidence": [
    "plan-state-contract",
    "risk-check-contract",
    "template-slice-replay"
  ],
  "evidence": [
    {
      "id": "plan-state-contract",
      "status": "passed",
      "type": "behavior-test",
      "run_id": "run-20260905113029-acfdeb",
      "summary": "verify 包含 Ignite CLI 契约测试，4 个 CLI 契约通过"
    },
    {
      "id": "risk-check-contract",
      "status": "passed",
      "type": "release-check",
      "run_id": "run-20260905113029-acfdeb",
      "summary": "同一候选版本通过 docs、typecheck、lint、format、Vitest、migration 和 build"
    },
    {
      "id": "template-slice-replay",
      "status": "passed",
      "type": "browser-journey",
      "run_id": "run-20260905113349-d01108",
      "summary": "认证路由守卫、会话恢复和 Tasks 权限/持久化操作 3 条 E2E 通过"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-05"
}
-->

# Ignite 执行机制升级

## 状态

进行中。一个 Plan 负责本次升级的完整交付，CLI、规则、测试、证据和设计回写都是它的子任务。

## 目标

- 让一个 Plan 对应一个可验收、可集成和可回滚的交付结果。
- 用结构化状态和发布范围替代多份手工状态副本。
- 按改动风险选择检查，不用文档修改启动无关的构建和迁移。
- 记录代码版本、输入指纹、命令、退出码和证据等级，禁止无证据宣布完成。
- 让长命令在中断后可以识别仍在运行、已完成或需要重试。
- 用现有 Tasks 参考切片完成一次从干净模板到可用功能的演练，并记录基线与优化后耗时。

## 非目标

- 不重写 Tasks 业务和现有 UI。
- 不删除或批量改写历史 Plan。
- 不更换 Next.js、Hono、Prisma、Better Auth 或 React Query。
- 不建设独立任务管理后台，不接入外部凭据或真实第三方平台。

## 变更类型

- 类型：`[基础设施变更]`
- 影响的存量路径：`AGENTS.md`、现有文档检查与模块脚手架
- 新增的增量路径：结构化 Plan 元数据、发布范围、执行证据和 `ignite` CLI
- 兼容性影响：历史 Plan 保留为 `legacy_unverified`，新 Plan 使用结构化状态
- 数据迁移或回滚要求：无业务数据库迁移；删除新增文档与脚本即可回滚

## 输入规格

- 审查报告：本轮用户提供的 Ignite 执行效率与规范升级审查报告
- Standards：[`../standards/workflow.md`](../standards/workflow.md)、[`../standards/testing.md`](../standards/testing.md)
- Designs：`docs/designs/` 中当前架构、API、数据库和时序事实
- Source of truth：`src/`、`prisma/`、`tests/`、`package.json`

## 已关闭问题

- 一个 Plan 可以包含实现、测试修复、格式修复和状态回写；不为“收口”再开 Plan。
- 历史 Plan 不批量迁移；结构化校验只约束新格式。
- 当前发布范围使用 JSON 机器源，状态摘要由 CLI 生成。
- 检查 runner 只记录和编排命令，不把失败改写成成功。

## 测试与验收设计

| 验收标准                                            | 先失败的测试或检查                   | 实现后命令                                                   | 适用层级  |
| --------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ | --------- |
| AC-001 结构化 Plan 的非法状态和无证据完成必须失败   | `tests/contracts/ignite-cli.test.ts` | `pnpm exec vitest run tests/contracts/ignite-cli.test.ts`    | contract  |
| AC-002 文档改动的自动检查不包含 Next、Prisma 或 E2E | CLI dry-run 输出                     | `pnpm ignite:check -- --plan IGT-001 --level auto --dry-run` | contract  |
| AC-003 同一输入不会重复启动仍在运行或已通过的检查   | run 记录契约测试                     | `pnpm exec vitest run tests/contracts/ignite-cli.test.ts`    | contract  |
| AC-004 Tasks 参考切片保留权限、保存和用户入口闭环   | 现有 API/E2E 测试                    | `pnpm test`、`pnpm test:e2e`                                 | API / E2E |
| AC-005 基线与优化后耗时有同一口径的记录             | benchmark JSON 记录                  | `pnpm ignite:benchmark`                                      | evidence  |

## 实现任务

- [x] 建立 Plan 元数据、有限状态、发布范围和状态摘要入口。
- [x] 建立按改动风险选择检查的 CLI，并记录运行证据。
- [x] 为需求模板增加稳定 REQ/AC 编号约定。
- [x] 让模块脚手架与正式 Plan 模板共享结构要求。
- [ ] 运行契约测试并修复所有实现问题。
- [ ] 以干净模板演练 Tasks 参考切片并写入证据。
- [ ] 更新标准、状态摘要和最终设计回写。

## 验收方式

- [ ] `pnpm docs:check`
- [ ] `pnpm exec vitest run tests/contracts/ignite-cli.test.ts`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e`
- [ ] `pnpm ignite:check -- --plan IGT-001 --level auto --dry-run`
- [ ] `pnpm ignite:status -- --write`
- [ ] `git diff --check`

## 设计回写

- [ ] `docs/standards/workflow.md`
- [ ] `docs/standards/testing.md`
- [ ] `docs/others/ignite-status.md`
- [ ] `docs/others/evidence/`

## 状态记录

| 时间       | 状态   | 说明                              |
| ---------- | ------ | --------------------------------- |
| 2026-09-05 | active | 建立执行机制升级 Plan 和 CLI 骨架 |

## 准出条件

- [ ] 所有验收标准有对应证据。
- [ ] 运行失败、跳过、阻塞和未执行项被分别记录。
- [ ] Tasks 参考切片从干净版本可复现，不把模板升级文档本身当作功能验收。
- [ ] Plan 状态、发布范围和状态摘要一致。
