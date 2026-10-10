<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791599676554164539",
  "release": "method-reading-v1",
  "status": "active",
  "outcome": "通过精简方法索引与单独正文读取消除批量输出导致的漏读",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "text": "普通文档维护先取得精简清单，再逐份读取全部必需正文",
      "requirements": ["REQ-METHOD-013"]
    }
  ],
  "constraints": [
    "保持原有全文读取兼容，不新增适配文件或技能副本",
    "当前学生副本继续冻结版本，父任务不帮助其执行"
  ],
  "non_goals": ["索引成功不能充当技能正文读取证明", "一次模型运行不能证明普遍可靠性"],
  "authorization": {
    "source": "同一用户任务要求修复观察到的全部执行问题；第二轮公开输出已显示正文截断及未补读"
  },
  "deliverables": ["精简原生方法清单入口与既有规则引导"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "086d004d39d2c9794c1707ba4382820a78d009ce",
  "requirements": ["REQ-METHOD-013"],
  "acceptance": [
    {
      "checks": [
        {
          "test": "tests/contracts/document-method-entry.test.ts::[AC-METHOD-013]",
          "layer": "unit"
        }
      ],
      "required_layers": ["unit"],
      "tests": ["tests/contracts/document-method-entry.test.ts::[AC-METHOD-013]"],
      "id": "AC-METHOD-013"
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
      "acceptance": ["AC-METHOD-013"],
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-013"],
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
    "migration_impact": "none",
    "rollback": "回滚精简读取入口与所属文档引导",
    "destructive_authorization": null,
    "access_rationale": "只读本项目方法资源，无业务数据访问",
    "access_scope": "not-applicable"
  },
  "write_scope": [
    "scripts/ignite/skill-reader.mjs",
    "tests/contracts/document-method-entry.test.ts",
    "docs/features/",
    "docs/plans/",
    "docs/designs/",
    "docs/standards/",
    "docs/others/"
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

# Ignite 实施计划：method-reading

> 复制本文件到 `docs/plans/YYYYMMDD-method-reading.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

由本 Plan 元数据记录唯一目标、任务与证据。

## 目标

由本 Plan 元数据记录唯一目标、任务与证据。

## 原始目标与覆盖核对

由本 Plan 元数据记录唯一目标、任务与证据。

## 整体判断与推进顺序

由本 Plan 元数据记录唯一目标、任务与证据。

## 非目标

由本 Plan 元数据记录唯一目标、任务与证据。

## 变更类型

由本 Plan 元数据记录唯一目标、任务与证据。

## 输入规格

由本 Plan 元数据记录唯一目标、任务与证据。

## 已关闭问题

由本 Plan 元数据记录唯一目标、任务与证据。

## 测试与验收设计

由本 Plan 元数据记录唯一目标、任务与证据。

## 实现任务

由本 Plan 元数据记录唯一目标、任务与证据。

## 验收方式

由本 Plan 元数据记录唯一目标、任务与证据。

## 设计回写

由本 Plan 元数据记录唯一目标、任务与证据。

## 状态记录

由本 Plan 元数据记录唯一目标、任务与证据。

## 准出条件

由本 Plan 元数据记录唯一目标、任务与证据。

第二轮原生 --for 多目录输出中，仅 how、experience-first、unslop 的完整正文被观察到，剩余必需方法被截断且未补读，已进入规格和红灯。因此不能把读取命令成功当作全文读取。保留旧全文 API，新 --list 返回 owner 固定职责及必需方法命令；实际正文一次一个方法读取。按 how、figure-it-out、show-me-your-work 和原生 TDD 修复此资源入口，不测技能提速，不用正文词句匹配充当模型效果验证。完成后回写执行事实；学生副本保持独立，最后重新克隆当前源开展正常需求运行。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [ ] T2 · 提交真实行为测试并记录红灯 · doing
- [ ] T3 · 实施最小存量修改 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
