<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791666534466332637",
  "release": "tdd-recovery-v1",
  "status": "active",
  "outcome": "让测试修正后的未完成 Plan 能合法重启真实红灯，保留历史并完成后续验证。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-021"],
      "text": "消除红灯失配后的状态恢复死路，不伪造证据或改完成历史"
    }
  ],
  "constraints": [
    "只修改模板工具与所属文档，不代改独立学生副本。",
    "保留所有旧回执；修正后的用例仍必须真实失败再实现。",
    "仅本地修改、提交与验证，不推送或部署。"
  ],
  "non_goals": [
    "不把绿灯补成红灯，不放宽一致性或完成规则。",
    "不自动删除或回滚业务实现，不修改已完成 Plan。"
  ],
  "authorization": {
    "source": "用户要求依据独立试跑继续修复问题，并重新从干净副本验证完整闭环。"
  },
  "deliverables": [
    "原生 TDD 重启入口及准确反馈",
    "拥有目录中的恢复步骤",
    "回归与真实 Plan/Release 证据"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "a746233a3117cde0525f60f5a94edb6cda6deb61",
  "requirements": ["REQ-METHOD-021"],
  "acceptance": [
    {
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-021] reopens a changed acceptance without forging red proof or losing history"
        }
      ],
      "tests": [
        "tests/contracts/method-recovery.test.ts::[AC-METHOD-021] reopens a changed acceptance without forging red proof or losing history"
      ],
      "required_layers": ["unit"],
      "id": "AC-METHOD-021"
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
      "acceptance": ["AC-METHOD-021"],
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-021"],
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
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
    "access_scope": "not-applicable",
    "migration_impact": "none",
    "access_rationale": "仅维护 Plan 状态，不访问业务数据",
    "rollback": "回滚工具提交，保留已记录的恢复过程和原始失败",
    "destructive_authorization": null
  },
  "write_scope": [
    "scripts/ignite/state.mjs",
    "scripts/ignite/cli.mjs",
    "tests/contracts/method-recovery.test.ts",
    "docs/features/ai-execution-trust.md",
    "docs/plans/README.md",
    "docs/standards/testing.md",
    "docs/designs/execution.md",
    "docs/plans/20261011-tdd-recovery.md",
    "docs/plans/releases/tdd-recovery-v1.json",
    "docs/others/evidence/tdd/",
    "docs/others/evidence/runs/",
    "docs/others/ignite-status.md"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-10"
}
-->

# TDD 恢复流程

## 状态

由顶部元数据和原生任务进度生成。

## 目标

测试修正后能够合法重新取得红灯，继续原交付，不靠伪造凭证或放宽规则完成。

## 原始目标与覆盖核对

| 原始要求与来源                                                           | 目标                                    | REQ            | AC            | 处理 |
| ------------------------------------------------------------------------ | --------------------------------------- | -------------- | ------------- | ---- |
| 用户要求修复独立试跑问题并完整闭环；学生试跑因删除测试修正，无法合法完成 | 提供保留历史的 TDD 重启，仍要求实际重验 | REQ-METHOD-021 | AC-METHOD-021 | 纳入 |
| 用户要求让 AI 自己运用方法，不另设适配文件                               | 原生反馈和 testing/Plan README 明确步骤 | REQ-METHOD-021 | AC-METHOD-021 | 纳入 |

## 整体判断与推进顺序

学生副本 28599e3 完整集成通过，却因删除用例增加等待而无法完成。当前原生 active 状态变更也会因红灯失配拒绝，所以只有拒绝没有直接恢复入口。先用真实 CLI 复现恢复失败，再提供限于未完成 Plan 的重启。重启撤销选定 AC 的旧证明绑定及相关任务完成状态，记录原因，保留回执、测试和业务代码；它不能替代重新取得真实红灯。

AI 之后须恢复该 AC 实现前的行为，提交正确用例及状态，按原生 red 取得真实失败，再提交回执、重做实现和验证。不得在已工作的实现上制造失败，不能写入假回执，也不能把旧绿灯拼作新验收。

## 非目标

不自动回滚业务或修改完成历史，不改学生副本，不放宽完成规则。

## 变更类型

存量工程流程修复。变更只写原 Plan；没有业务数据或迁移影响。

## 输入规格

Feature ai-execution-trust，Plan README、testing 和 execution Design；原生状态及 TDD CLI 为实现入口。

## 已关闭问题

重启需要明确 AC 和原因，只允许 active、verifying、blocked 的未完成 Plan。重复请求在已等待真实红灯时不重复回写。缺新红灯继续拒绝实施和完成。

## 测试与验收设计

临时 Git fixture 构造旧记录并修正测试，先观察原生 active 变更被拒，再调用新重启入口检查状态、原因、回执保留、测试不变、实施拒绝、重复不变及完成历史保护。Fixture 只证明工具行为，不是正式红灯凭证；本 Plan 另用原生 runner 记录真实失败。

## 实现任务

准备并提交规格和测试，记录真实失败，最小实现恢复操作及反馈，回写所属规则并完成集成和 Release。

## 验收方式

原生 prepare，tdd red，check --level auto；Plan 完成后用 tdd-recovery-v1 执行生产构建和全局浏览器验收。

## 设计回写

说明恢复范围、保留记录、任务重开和新证据要求。

## 状态记录

基线 a746233。独立试跑已结束，准确保留其完成前缺口；本轮尚未实现。

## 准出条件

AC-METHOD-021 真实失败及对应绿灯、Plan integration 和 Release 通过，原生交付覆盖有效；再以干净模板开展独立试跑，不把工具测试当作模型效果。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [ ] T2 · 提交真实行为测试并记录红灯 · doing
- [ ] T3 · 实施最小存量修改 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
