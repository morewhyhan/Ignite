<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791594029506382263",
  "release": "agent-preparation-v1",
  "status": "active",
  "outcome": "修复开工顺序、目标覆盖和测试脚手架，并重新观察独立 Agent 的完整执行",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-PREP-001"],
      "text": "修复准备阶段提前修改产品代码的问题"
    },
    {
      "requirements": ["REQ-PREP-002"],
      "text": "修复一个行为对应多个原始目标的误报"
    },
    {
      "requirements": ["REQ-PREP-003"],
      "text": "脚手架只生成准备资料并提供真实数据库测试起点"
    }
  ],
  "constraints": [
    "使用 WSL/NVM；保留历史 task_contract 1 的兼容行为",
    "修复后重新克隆，不额外提示子智能体使用技能"
  ],
  "non_goals": [
    "不能用一次廉价模型运行证明所有模型总能完整执行",
    "不修改学生产品业务或采用真实外部数据"
  ],
  "authorization": {
    "source": "用户明确要求依上一轮观察修复，清理 TEMP 后重新调用廉价子智能体"
  },
  "deliverables": ["原生开工检查、Release 覆盖判定、准备脚手架", "同普通需求的新副本执行观察"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "37bfdb04f186fc2a473cf22da3ce36c5b620786b",
  "requirements": ["REQ-PREP-001", "REQ-PREP-002", "REQ-PREP-003"],
  "acceptance": [
    {
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-001]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-001",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-PREP-001]"]
    },
    {
      "checks": [
        {
          "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-002]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-002",
      "tests": ["tests/contracts/preparation-contract.test.ts::[AC-PREP-002]"]
    },
    {
      "checks": [
        {
          "test": "tests/contracts/template-runtime.test.ts::[AC-PREP-003]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-PREP-003",
      "tests": ["tests/contracts/template-runtime.test.ts::[AC-PREP-003]"]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "提交真实行为测试并记录红灯",
      "phase": "red",
      "acceptance": ["AC-PREP-001", "AC-PREP-002", "AC-PREP-003"],
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-PREP-001", "AC-PREP-002", "AC-PREP-003"],
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
      "status": "doing"
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-applicable",
    "migration_impact": "none",
    "rollback": "回滚本轮原生工具和规则提交",
    "access_rationale": "只调整执行检查和脚手架，无业务数据访问",
    "destructive_authorization": null
  },
  "write_scope": [
    ".ai/pstack/skills/figure-it-out/SKILL.md",
    ".ai/pstack/sources.json",
    "scripts/ignite/",
    "scripts/create-module.mjs",
    "scripts/create-change.mjs",
    "tests/contracts/preparation-contract.test.ts",
    "tests/contracts/template-runtime.test.ts",
    "docs/features/ai-execution-trust.md",
    "docs/plans/",
    "docs/standards/",
    "docs/designs/execution.md",
    "docs/others/evidence/",
    "AGENTS.md"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-PREP-001",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-001]",
      "run_id": "tdd-20261010011650-f5032c"
    },
    {
      "acceptance_id": "AC-PREP-002",
      "test": "tests/contracts/preparation-contract.test.ts::[AC-PREP-002]",
      "run_id": "tdd-20261010011709-58abf4"
    },
    {
      "acceptance_id": "AC-PREP-003",
      "test": "tests/contracts/template-runtime.test.ts::[AC-PREP-003]",
      "run_id": "tdd-20261010011731-99f951"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-10"
}
-->

# Ignite 实施计划：agent-preparation

> 复制本文件到 `docs/plans/YYYYMMDD-agent-preparation.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

依据当前 Plan 元数据执行。

## 目标

让新项目的 AI 沿原生准备、红灯、实现、验收顺序推进，消除上一轮已复现的工具阻碍。独立学生系统运行检查实际默认执行，不要求用户提醒技能。

## 原始目标与覆盖核对

用户要求依据上一轮观察修复并重建 TEMP。提前品牌实现对应 REQ-PREP-001 / AC-PREP-001；同一旅程覆盖多目标误报对应 REQ-PREP-002 / AC-PREP-002；准备脚手架和真实数据库起点对应 REQ-PREP-003 / AC-PREP-003。最后保留同一普通学生需求，观察实际方法使用和业务交付。

## 整体判断与推进顺序

上轮已完整读取技能，症状不是未发现技能。开工边界仍依赖提示，原生检查只核对任务而未观察提前代码。采用现有 Plan 任务阶段与 validTdd 集合，新契约版本 2 检查首次有效红灯前的工作区、暂存区和本 Plan 提交；旧契约 1 保持兼容。拒绝增加另一个适配文件或宿主写入拦截器。先复现三条行为，记录真实红灯，再最小实现和原生门禁。正常 Agent 副本独立运行，不提供观察结论。发现不同原因时回到相同目标纠正，不能把一次运行推广为所有模型保证。

## 非目标

不以技能提速或测试数量作指标。不把模拟 API 当持久化验收，不修改学生系统副本来帮助它通过。

## 变更类型

存量工程工具修复，无数据迁移。可回滚本轮提交；新契约只影响新 Plan，不迁移历史记录。

## 输入规格

Feature：[AI 执行可信度](../features/ai-execution-trust.md)。当前事实：[执行机制](../designs/execution.md)。采用与检查规则沿原有 standards 维护。原生 CLI、state、execution-contract、tdd 与模块脚手架为唯一实施范围。

## 已关闭问题

授权与模型费用已在对话确定，独立执行使用当前可用廉价 Luna。此前 30 分钟中断由父任务自行设置，不作为开发最终失败证据。

## 测试与验收设计

AC-PREP-001 驱动真实 Git 和 CLI，先确认正常准备，再验证暂存区提前品牌变化被拒且 Plan 不被修改。AC-PREP-002 驱动 Release 准备入口，接受一致复用、拒绝矛盾延期。AC-PREP-003 实际执行模块生成，检查文档和失败测试存在、产品源码尚未生成。测试夹具范围曾误写为整个 src/ 导致共享边界错误，已仅修正夹具设置，验收断言未改。

## 实现任务

顶部 tasks 是唯一进度。使用原生 task set-status；prepare、red、implement、verify 分工不另建 Plan。

## 验收方式

原生 tdd red 已为 AC-PREP-001/002/003 在 a9b26a4 记录真实失败。实现后按本 Plan 运行 integration，再完成 Release 的生产构建与全量真实浏览器回归。独立副本另以实际读文件、任务、原生记录和学生行为观察，不计为模板业务验收。

## 设计回写

执行事实回写 docs/designs/execution.md；准备顺序、测试起点和覆盖规则写入既有所属 README/standards，技能仅链接任务契约真源。

## 状态记录

覆盖和脚手架回归已通过。开工检查回归在收窄夹具范围后通过。历史红灯和本轮完整运行证据由原生工具记录，不复写通过状态。

## 准出条件

三条 AC 的真实红灯与绿灯、工程 integration 和 Release 最终版本通过后才完成工具修复。独立学生运行报告必须区分实际调用、完整行为与未完成项，不能凭技能文件存在或工作者口头声称通过。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [x] T3 · 实施最小存量修改 · done
- [ ] T4 · 验证兼容性并回写设计 · doing

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
