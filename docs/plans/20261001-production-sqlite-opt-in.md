<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790791844798755166",
  "release": "production-sqlite-opt-in-v1",
  "status": "draft",
  "outcome": "仅在显式 opt-in 和持久化绝对路径下允许低流量单机展示站使用 SQLite，其他生产环境仍默认拒绝",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [{ "text": "为展示站提供受限的生产 SQLite opt-in，同时保持模板生产默认拒绝 SQLite", "requirements": ["REQ-PRODUCT-020"] }],
  "constraints": ["SQLite 仅用于低流量单机展示站", "必须使用持久化绝对文件路径并自行备份", "默认关闭 opt-in，既有生产保护继续生效"],
  "non_goals": ["提供高可用或横向扩展数据库", "自动备份或数据库迁移到其他 provider"],
  "authorization": {
    "source": "用户已授权 Ignite 展示站使用 SQLite；此前明确要求将当前仓库部署至自己的服务器和域名"
  },
  "deliverables": ["有受限 opt-in 的生产环境校验", "对默认拒绝与绝对持久路径规则的契约测试", "更新后的运行时与数据库约束说明"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "91db731a597536fbc2932c0856d7957c7b87ee72",
  "requirements": ["REQ-PRODUCT-020"],
  "acceptance": [
    {
      "id": "AC-PRODUCT-018",
      "tests": ["tests/contracts/server-env.test.ts::[AC-PRODUCT-018] keeps production SQLite opt-in explicit and requires a durable absolute path"],
      "required_layers": ["unit"],
      "checks": [{ "test": "tests/contracts/server-env.test.ts::[AC-PRODUCT-018] keeps production SQLite opt-in explicit and requires a durable absolute path", "layer": "unit" }]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "明确默认拒绝、显式 opt-in 与持久路径契约",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "先用契约测试验证当前行为拒绝合法 opt-in",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "实施最小生产 SQLite opt-in 并更新运行时说明",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "验证配置边界并回写设计事实",
      "status": "todo"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "assigned-worker",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "低流量单机展示站的持久 SQLite 文件；应用继续按当前登录 session 隔离用户数据",
    "access_rationale": "用户明确接受此展示部署使用 SQLite；生产默认仍禁用，数据库文件放在版本目录外并定期备份",
    "migration_impact": "不改变 Prisma provider、Schema 或历史 migration；首次上线在持久目录执行现有 migrations",
    "rollback": "停止应用并备份数据库，回退应用版本；关闭 opt-in 会重新拒绝 SQLite，不删除数据库文件",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261001-production-sqlite-opt-in.md",
    "docs/plans/releases/production-sqlite-opt-in-v1.json",
    "docs/others/evidence/tdd/",
    "docs/features/product.md",
    "src/server/env-policy.mjs",
    "src/server/env.ts",
    ".env.example",
    "tests/contracts/server-env.test.ts",
    "docs/designs/runtime.md",
    "docs/standards/adoption.md",
    "docs/others/adr/0003-sqlite-local-only.md"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-01"
}
-->

# Ignite 实施计划：production-sqlite-opt-in

> 复制本文件到 `docs/plans/YYYYMMDD-production-sqlite-opt-in.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用户明确接受展示站使用 SQLite。让它能在生产模式下安全地使用服务器持久目录中的 SQLite，同时保持所有其他部署默认拒绝 SQLite，避免把演示场景误当成通用生产建议。

## 原始目标与覆盖核对

| 用户原话或可追溯来源 | 本轮目标 | REQ | AC | 处理结果 |
| --- | --- | --- | --- | --- |
| “这个只是作为一个展示页面，所以数据库的话，就使用 SQLite 没关系。” | 允许低流量单机展示站显式启用 SQLite；生产默认继续拒绝 | REQ-PRODUCT-020 | AC-PRODUCT-018 | 保留用户选择，限定持久化绝对路径 |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

顶部 `change_type` 只选 `[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动。说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

涉及 `prisma/`、认证或业务 API 的 Plan，还要填写顶部 `data_contract`：资源属于谁、访问控制依据、迁移影响和恢复方式。删除或不可逆转换必须记录用户授权。简单决定写在这里即可；只有存在需要长期解释的架构取舍时才新增 ADR。

## 输入规格

只引用本轮相关的 Feature、Standards、Design、代码与测试。跨 Plan 依赖在 `depends_on` 与 `dependency_contracts` 中写清接口契约；交接成果写入 `handoff.interfaces`、`migrations`、`tests` 和 `remaining`。

## 已关闭问题

顶部 `open_questions` 记录未决问题，`authorization.source` 记录实施授权来源。不要把空问题列表当作目标完整性证明。

## 测试与验收设计

每个 AC 的 `tests` 与 `checks[].test` 必须引用同一带 `[AC-*]` 标记的可执行用例。`required_layers` 和 `verification_requirements` 表示必须满足的验证层级：纯逻辑用 `unit`；UI 交互补 `browser`；持久化补 `database`；真实第三方依赖补 `external`。`verification_contract: 2` 的 Plan 在 integration 中执行自己映射的所有行为层；Release 再对已完成的 Plan 组合执行生产构建和全量浏览器回归。进入 ready 前，脚手架占位失败测试必须换成真实用户行为断言。

## 实现任务

分解可交付工作至顶部 `tasks`，每项有稳定 ID、标题和状态。`remaining_work` 仅放尚未能转成明确任务的验收缺口，不重复列任务。

## 验收方式

新行为先写验收测试并提交规格基线，再对每条 AC 执行 `pnpm ignite tdd red --plan <IGT-ID> --ac <AC-ID>`。该命令只记录真实断言失败；环境错误和脚手架占位失败均不算。提交红灯记录后再实施，测试文件在红灯与绿灯之间保持不变。随后运行 `pnpm ignite check --plan <IGT-ID> --level integration`，完成本 Plan 后将它标记为 done。Release 中所有 Plan 都完成后，运行 `pnpm ignite release verify <release-id> --plan <done-plan-id>`，只对最终组合执行一次生产构建和全量浏览器回归。历史 `verification_contract: 1` Plan 继续按旧流程验证。

## 设计回写

完成后只回写受影响的当前事实到 `docs/designs/`，不把本 Plan 的过程说明复制过去。

## 状态记录

<!-- ignite-progress -->

状态：`draft`（由元数据生成）

- [ ] T1 · 识别现有行为、写入边界和原始目标 · todo
- [ ] T2 · 补充需求和目标行为测试 · todo
- [ ] T3 · 实施最小存量修改 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：原始目标尚未细化，无法确认完整验收场景
证据：尚无
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
