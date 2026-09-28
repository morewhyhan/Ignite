<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790601198510423198",
  "release": "ui-visual-refresh-v1",
  "status": "active",
  "outcome": "改善模板示例界面的视觉层级、主题控制和窄屏体验",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "让用户一眼区分页面重点，获得一致、清晰且适配窄屏的模板界面",
      "requirements": ["REQ-PRODUCT-018"]
    }
  ],
  "constraints": ["保留现有认证、导航、任务和主题切换行为", "保留旧版已存储主题的兼容读取"],
  "non_goals": [
    "不重做产品功能或认证流程",
    "不增加移动原生端或桌面端",
    "不创建或发布 GitHub Release"
  ],
  "authorization": {
    "source": "用户请求继续优化前端风格样式，并询问 GitHub 是否可为每次版本更新编写说明"
  },
  "deliverables": ["一致的模板视觉基线", "可访问且持久化的主题选择器", "响应式浏览器验收"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "4dba8c68cb4d0c0ee5c8c31a5143df50b451452d",
  "requirements": ["REQ-PRODUCT-018"],
  "acceptance": [
    {
      "id": "AC-PRODUCT-016",
      "required_layers": ["browser"],
      "checks": [
        {
          "layer": "browser",
          "test": "tests/e2e/visual-baseline.spec.ts::[AC-PRODUCT-016] presents a readable responsive landing page and persists theme choice"
        }
      ],
      "tests": [
        "tests/e2e/visual-baseline.spec.ts::[AC-PRODUCT-016] presents a readable responsive landing page and persists theme choice"
      ]
    }
  ],
  "verification_requirements": ["browser"],
  "tasks": [
    {
      "id": "T1",
      "title": "完成视觉契约和浏览器验收设计",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "实施统一主题与核心页面视觉改版",
      "status": "todo"
    },
    {
      "id": "T3",
      "title": "验证响应式页面、主题持久化和回归路径",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "回写视觉设计事实和验收记录",
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
  "owner": "integrator",
  "risk": "ui",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "纯前端展示与本地主题偏好，不触及认证、业务 API 或数据库",
    "migration_impact": "none",
    "rollback": "还原本轮 CSS 与组件样式即可；旧 color-scheme localStorage 键仍兼容读取",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20260928-ui-visual-refresh.md",
    "docs/plans/releases/ui-visual-refresh-v1.json",
    "docs/others/evidence/tdd/",
    "docs/features/product.md",
    "docs/designs/design.md",
    "docs/others/test-cases/product.md",
    "src/app/globals.css",
    "src/components/ui/button.tsx",
    "src/components/layout/dashboard-layout.tsx",
    "src/modules/landing/components/landing-screen.tsx",
    "src/modules/dashboard/components/dashboard-screen.tsx",
    "src/modules/tasks/components/tasks-screen.tsx",
    "src/modules/tasks/components/task-row.tsx",
    "src/modules/settings/components/settings-screen.tsx",
    "src/modules/auth/components/auth-modal.tsx",
    "src/modules/theme/components/color-scheme-selector.tsx",
    "tests/e2e/visual-baseline.spec.ts"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-PRODUCT-016",
      "test": "tests/e2e/visual-baseline.spec.ts::[AC-PRODUCT-016] presents a readable responsive landing page and persists theme choice",
      "run_id": "tdd-20260928164357-9dde7c"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-28"
}
-->

# Ignite 实施计划：ui-visual-refresh

> 复制本文件到 `docs/plans/YYYYMMDD-ui-visual-refresh.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

顶部元数据的 `status` 是唯一状态；正文不复制当前状态。`tasks` 是唯一的子任务状态，使用 `todo`、`doing`、`done`；真正阻塞时由 Plan 的 `status` 与 `blocker` 表达。不要在正文另建任务复选框。下方进度块由工具刷新，勿手改。

## 目标

用一句用户可观察的结果描述本轮成果。先写清原始目标，再将其拆成 `goals`、REQ、AC 和测试。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                                 | 本轮目标                                                     | REQ             | AC             | 处理结果                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------ | --------------- | -------------- | -------------------------------------------------------------------------- |
| 用户要求继续优化前端视觉，并询问 GitHub 是否可为每次版本更新编写说明 | 建立更清晰统一的响应式界面；说明 GitHub Release 更新说明能力 | REQ-PRODUCT-018 | AC-PRODUCT-016 | 界面改版纳入本 Plan；Release 更新说明可按版本 Tag 发布，本轮不创建 Release |

进入 `ready` 前回看原始请求，确认目标、约束、必须保留的能力都已列入；不把 AI 自己改写后的 goals 当作原始输入。此表是语义审查记录，不能伪称机器已证明无遗漏。

## 非目标

把本轮不处理的范围写入顶部 `non_goals`，这里仅解释容易误解的边界。

## 变更类型

- 类型：`[存量改动]`

说明兼容性、数据迁移和回滚策略，并把共享文件写入 `shared_files`，声明 `path`、`owner` 与 `mode`（`exclusive` 或 `integrator`）。

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

状态：`active`（由元数据生成）

- [x] T1 · 完成视觉契约和浏览器验收设计 · done
- [ ] T2 · 实施统一主题与核心页面视觉改版 · todo
- [ ] T3 · 验证响应式页面、主题持久化和回归路径 · todo
- [ ] T4 · 回写视觉设计事实和验收记录 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

每条 REQ 被 AC 覆盖，AC 有匹配层级的真实测试；`tasks` 全部完成，`remaining_work` 清空；`integrated_commit` 可追溯，所需证据属于当前输入与环境；Design 已回写。只有这些条件经验证成立，才把 Plan 标记为 `done`。
