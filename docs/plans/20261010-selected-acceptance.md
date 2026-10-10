<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791616797429443754",
  "release": "selected-acceptance-v1",
  "status": "active",
  "outcome": "修正手动选择单项测试时报告器对未选择验收的误报，保持绑定运行严格校验",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-016"],
      "text": "修正手动选择单项测试时报告器对未选择验收的误报，保持绑定运行严格校验"
    }
  ],
  "constraints": [
    "只处理局部运行的范围识别；不放松绑定 Plan、CI 或验收结果文件的要求",
    "学生副本保持冻结版本，不提示方法步骤"
  ],
  "non_goals": ["手动单项通过不能代替 Plan 或 Release 验收"],
  "authorization": {
    "source": "用户要求修复独立学生系统试跑发现的问题；本轮公开输出已复现单项运行误报"
  },
  "deliverables": ["局部 Vitest 选择准确识别与真实运行回归"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "8be680d88def80c40207804e19541c5ef9e5c00b",
  "requirements": ["REQ-METHOD-016"],
  "acceptance": [
    {
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/acceptance-runtime.test.ts::[AC-METHOD-016]"
        }
      ],
      "required_layers": ["unit"],
      "id": "AC-METHOD-016",
      "tests": ["tests/contracts/acceptance-runtime.test.ts::[AC-METHOD-016]"]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "phase": "prepare",
      "title": "还原局部运行误报及绑定验收边界",
      "id": "T1",
      "status": "done"
    },
    {
      "acceptance": ["AC-METHOD-016"],
      "phase": "red",
      "title": "用真实 Vitest 子进程复现选择误报",
      "id": "T2",
      "status": "doing"
    },
    {
      "acceptance": ["AC-METHOD-016"],
      "phase": "implement",
      "title": "准确识别手动选择范围",
      "id": "T3",
      "status": "todo"
    },
    {
      "phase": "verify",
      "title": "验证严格验收兼容并回写设计",
      "id": "T4",
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
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "migration_impact": "none",
    "rollback": "回滚报告器选择范围修复，保留失败记录",
    "destructive_authorization": null,
    "access_rationale": "测试报告器只处理本地测试结果，不访问业务数据",
    "access_scope": "not-applicable"
  },
  "write_scope": [
    "scripts/testing/vitest-acceptance-reporter.mjs",
    "tests/contracts/acceptance-runtime.test.ts",
    "docs/features/",
    "docs/plans/",
    "docs/designs/",
    "docs/standards/",
    "docs/others/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-016",
      "test": "tests/contracts/acceptance-runtime.test.ts::[AC-METHOD-016]",
      "run_id": "tdd-20261010081128-15462d"
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

# 局部验收选择修复

## 状态

目标、边界、任务和验收映射以顶部元数据为准。

## 目标

目标、边界、任务和验收映射以顶部元数据为准。

## 原始目标与覆盖核对

目标、边界、任务和验收映射以顶部元数据为准。

## 整体判断与推进顺序

目标、边界、任务和验收映射以顶部元数据为准。

## 非目标

目标、边界、任务和验收映射以顶部元数据为准。

## 变更类型

目标、边界、任务和验收映射以顶部元数据为准。

## 输入规格

目标、边界、任务和验收映射以顶部元数据为准。

## 已关闭问题

目标、边界、任务和验收映射以顶部元数据为准。

## 测试与验收设计

目标、边界、任务和验收映射以顶部元数据为准。

## 实现任务

目标、边界、任务和验收映射以顶部元数据为准。

## 验收方式

目标、边界、任务和验收映射以顶部元数据为准。

## 设计回写

目标、边界、任务和验收映射以顶部元数据为准。

## 状态记录

目标、边界、任务和验收映射以顶部元数据为准。

## 准出条件

目标、边界、任务和验收映射以顶部元数据为准。

公开试跑中 AC-STUDENTS-001 手动过滤运行通过，但未选择的 AC-STUDENTS-002 被报告为失败。报告器未识别 Vitest testNamePattern，导致无信息排查。采用 Vitest 自己的完整测试名称及已解析选择模式；只调整未绑定的手动运行，不改变 Plan、CI 或产出验收结果的严格范围。直接运行真实 Vitest，覆盖选中通过、选中跳过、绑定遗漏，避免只测试模拟列表。完整方法已读，职责落实到局部与完整验收边界。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 还原局部运行误报及绑定验收边界 · done
- [ ] T2 · 用真实 Vitest 子进程复现选择误报 · doing
- [ ] T3 · 准确识别手动选择范围 · todo
- [ ] T4 · 验证严格验收兼容并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

首次回归夹具意外收集已有 sample.test.ts，产生加载错误，不能作为行为红灯。该记录撤销；限定夹具文件后重新记录真实误报。实现暂时撤回，完成真实红灯后恢复。
