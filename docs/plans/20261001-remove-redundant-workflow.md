<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1790853920702377365",
  "release": "remove-redundant-workflow-v1",
  "status": "active",
  "outcome": "使用者直接在原生文档处理依赖与交接，模板诊断和生成无需额外的 workflow 文档",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "移除冗余 workflow 及当前依赖，将必要协作细节归还 Plan 与 Release，并保持实际诊断、生成和回归有效",
      "requirements": ["REQ-EXECUTION-040"]
    }
  ],
  "constraints": [
    "保留依赖快照、共享负责人、交接和最终组合验收的现有契约",
    "六项专业规则仍由各自原生文档负责，不另建总管、提示词或并行状态",
    "保留已完成 Plan、Release 与 TDD 的历史记录，不篡改过去版本"
  ],
  "non_goals": [
    "改变产品业务、认证、数据库或运行时",
    "新增 AI 提示词、协调台账或工作流文件",
    "宣称结构与回归测试证明 AI 的实际执行质量改善",
    "删除建设期 Plan 或发布记录、推送或部署"
  ],
  "authorization": {
    "source": "用户已认可吸收必要细节后删除冗余协作文档，明确指示：行行行，交给你来协调。你把这些该删的删。"
  },
  "deliverables": [
    "docs/plans/README.md",
    "docs/plans/releases/README.md",
    "docs/plans/_template.md",
    "scripts/template-doctor.mjs",
    "scripts/check-docs.mjs",
    "tests/contracts/document-ownership.test.ts"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "d2c5bfcf6bebf94cdb497eec5dc76720adc9257b",
  "requirements": ["REQ-EXECUTION-040"],
  "acceptance": [
    {
      "id": "AC-EXECUTION-040",
      "tests": [
        "tests/contracts/document-ownership.test.ts::[AC-EXECUTION-040] diagnoses and scaffolds a template without a standalone workflow while requiring native Plan rules"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/document-ownership.test.ts::[AC-EXECUTION-040] diagnoses and scaffolds a template without a standalone workflow while requiring native Plan rules",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "核对职责与原始目标，确定删除和保留边界",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "定义真实诊断及生成验收，记录先行红灯",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "归还交接细节，删除 workflow，修正当前引用与工具依赖",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "回写设计并完成 Plan 和组合版本验收",
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
  "owner": "codex",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "仅调整执行文档入口、模板诊断及生成验收，不涉及业务数据",
    "migration_impact": "none",
    "rollback": "回退本轮提交，恢复旧文件和引用；无数据迁移",
    "destructive_authorization": null
  },
  "write_scope": [
    "AGENTS.md",
    "README.md",
    ".ai/README.md",
    "docs/README.md",
    "docs/features/execution.md",
    "docs/plans/20261001-remove-redundant-workflow.md",
    "docs/plans/releases/remove-redundant-workflow-v1.json",
    "docs/plans/README.md",
    "docs/plans/_template.md",
    "docs/plans/releases/README.md",
    "docs/standards/workflow.md",
    "docs/standards/README.md",
    "docs/standards/ai-agents.md",
    "docs/standards/adoption.md",
    "docs/designs/execution.md",
    "docs/others/test-cases/execution-focus.md",
    "docs/others/test-cases/product.md",
    "docs/others/evidence/tdd/",
    "scripts/check-docs.mjs",
    "scripts/template-doctor.mjs",
    "tests/contracts/document-ownership.test.ts",
    "tests/contracts/native-execution.test.ts",
    "tests/contracts/workflow-entry.test.ts",
    "tests/contracts/execution-reliability.test.ts",
    "tests/contracts/template-runtime.test.ts"
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

# Ignite 实施计划：删除冗余协作文档

## 状态

顶部元数据是唯一状态，任务进度由 CLI 生成。

## 目标

用户从原生 Plan 与 Release 入口就能处理依赖、交接与组合交付，无需额外 workflow 文件；删除后实际模板诊断和生成仍可用。

## 原始目标与覆盖核对

| 用户原话或可追溯来源                                               | 本轮目标                                                       | REQ               | AC               | 处理结果 |
| ------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------- | ---------------- | -------- |
| 不另建块块，依照条条与块块优化；已有文档说明协作是否还需要额外文件 | 原生 Plan 负责跨 Plan 交接，Release 负责组合完成，保留专业真源 | REQ-EXECUTION-040 | AC-EXECUTION-040 | 纳入     |
| 行行行，交给你来协调。你把这些该删的删。                           | 吸收必要细节后删除 workflow，同步引用、生成器和检查绑定        | REQ-EXECUTION-040 | AC-EXECUTION-040 | 纳入     |

作者已对照实际文件核对范围：删除的是冗余协调入口，历史证据、专业方法和具体 Plan/Release 继续保留。此人工审查不等同于机器证明语义完整。

## 整体判断与推进顺序

已确认的完整链路为专业文档 → 模板链接 → 实际脚手架 → 首次采用诊断 → 文档门禁 → Plan/Release 验收。AGENTS 已定义规格驱动 Loop，专业入口已有输入、输出与完成条件；workflow 的衔接表重复这些关系，少量依赖快照和交接细节属于 Plan。检查脚本仍要求 workflow，生成模板仍链接它。

当前主要问题是冗余文件被当作必要入口与基线依赖；直接删除会导致误报和断链。先以实际无 workflow 副本证明诊断与生成失败，再把必要细节放回所属入口并同步绑定，最后验证整个受影响链路。不把重复表格搬到另一份总管文档，不扩展产品功能或六项方法。

诊断正常而生成断链，修正模板链接；缺少 Plan 规则仍须失败，防止削弱基线检查。发现未归属的重要协作条件时补入原生 Plan/Release。真实生成及当前文档门禁通过后停止重复局部检查，完成规定的工程与组合验收。历史路径只是当时变更记录，不改写过去结果。

## 非目标

保留产品与数据库实现、依赖和 Vitest 检查范围；不开展模型有效性实验、不改写历史 Plan/TDD。不会为此新增管理文档。

## 变更类型

[存量改动]，基线由元数据记录。删除的文件在 Git 可恢复；工具及文档可一并回退。没有数据迁移或共享并行写入。

## 输入规格

[执行规格](../features/execution.md)、[Plan 规则](./README.md)、[Release 规则](./releases/README.md)、[当前执行设计](../designs/execution.md)，以及原 workflow、实际模板诊断与生成器、文档检查和对应契约测试。

## 已关闭问题

用户已授权删除冗余文件；具体交接细节归 Plan，组合完成归 Release。当前专业入口只保留单一真源；历史记录不作为新的执行入口。

## 测试与验收设计

AC-EXECUTION-040 在隔离临时 Git 仓库执行真实 template-doctor 与两种脚手架：没有 workflow 时正常诊断，移除必要 Plan 规则仍拒绝；实际生成的 Plan 链接直接落到原生段落，并可继续到 Release 完成条件。可发现误保留硬依赖、错误解除必要基线、生成断链和段落不匹配。

required_layers 为 unit，本轮不增加业务页面、持久化或外部集成。现有 AC-EXECUTION-039 继续检查全部专业链接与草稿未完成状态；原有依赖和所有权契约在完整回归中验证。正式文档门禁检查删除文件后所有当前链接有效，人工核对迁移细节没有遗漏。二者都不能证明低质量模型已学会抓住主要矛盾。

## 实现任务

任务由元数据 tasks 维护，CLI 刷新进度。

## 验收方式

提交规格与真实测试后先记录 AC-EXECUTION-040 红灯并提交证据，再修改文档、模板及检查器；保持目标断言不变。通过 ignite check --plan IGT-1790853920702377365 --level auto 后完成本 Plan，最后对同一最终版本运行 remove-redundant-workflow-v1 的 Release verify。

## 设计回写

执行设计更新为原生 Plan/Release 维护协作规则、实际无 workflow 副本可诊断和生成；不添加协调层或并行状态。

## 状态记录

- 2026-10-01：与实际入口、模板及检查脚本核对后确定删除边界，保留历史记录和必要协作契约。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 核对职责与原始目标，确定删除和保留边界 · done
- [ ] T2 · 定义真实诊断及生成验收，记录先行红灯 · doing
- [ ] T3 · 归还交接细节，删除 workflow，修正当前引用与工具依赖 · todo
- [ ] T4 · 回写设计并完成 Plan 和组合版本验收 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

## 准出条件

原始目标中的协作细节归还完成，workflow 已删除且当前链接及硬依赖清理；真实 TDD、当前 Plan integration 和 Release 最终检查可追溯，设计与实现一致。只报告实际通过结果。
