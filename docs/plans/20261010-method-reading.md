<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791599676554164539",
  "release": "method-reading-v1",
  "status": "done",
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
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "phase": "implement",
      "acceptance": ["AC-METHOD-013"],
      "status": "done"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "phase": "verify",
      "status": "done"
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
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-013",
      "test": "tests/contracts/document-method-entry.test.ts::[AC-METHOD-013]",
      "run_id": "tdd-20261010024013-60a152"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20261010025253-34f424"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "3f6fe3327b052b0760b75d2b86226457d8aeccce",
  "updated_at": "2026-10-10"
}
-->

# Ignite 实施计划：method-reading

> 本轮修复文档方法资源读取入口，维护记录在提交后由 Git 保存。

## 状态

任务状态由顶部 tasks 维护。

## 目标

消除批量方法正文输出被截断后继续执行的入口诱因。

## 原始目标与覆盖核对

用户要求修复观察到的流程问题，再从零验证。REQ-METHOD-013 / AC-METHOD-013 覆盖精简索引、完整单份读取和缺失失败。独立模型应用效果另由学生系统运行观察。

## 整体判断与推进顺序

保留原全文接口；默认先读索引，再逐份读真源。无需新增文件或重复正文。

## 非目标

不测试技能提速，不把一次运行当作所有模型的保证。

## 变更类型

存量改动；基线和写入范围见元数据。

## 输入规格

docs/features/ai-execution-trust.md 的 REQ-METHOD-013。

## 已关闭问题

旧全文读取保持兼容；新索引不充当已读证据。

## 测试与验收设计

真实 CLI 测试查询大型方法清单，再逐份核对完整正文，验证缺失资源整体失败。

## 实现任务

按 tasks 顺序记录红灯、实现和验收。

## 验收方式

Plan integration 和最终 Release 分层验证；另观察独立学生副本，不向其提供流程提示。

## 设计回写

docs/designs/execution.md 说明实际接口和默认操作。

## 状态记录

第二轮候选已进入红灯，但批量读取的多数正文被截断。父任务在独立主仓修复，保持候选版本不变。

## 准出条件

原生检查实际通过、证据落盘、设计回写后完成；模板发布时清理建设记录。

第二轮原生 --for 多目录输出中，仅 how、experience-first、unslop 的完整正文被观察到，剩余必需方法被截断且未补读，已进入规格和红灯。因此不能把读取命令成功当作全文读取。保留旧全文 API，新 --list 返回 owner 固定职责及必需方法命令；实际正文一次一个方法读取。按 how、figure-it-out、show-me-your-work 和原生 TDD 修复此资源入口，不测技能提速，不用正文词句匹配充当模型效果验证。完成后回写执行事实；学生副本保持独立，最后重新克隆当前源开展正常需求运行。

<!-- ignite-progress -->

状态：`done`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 提交真实行为测试并记录红灯 · done
- [x] T3 · 实施最小存量修改 · done
- [x] T4 · 验证兼容性并回写设计 · done

验收缺口：未记录；完成仍须实际证据
证据：check-integration / run-20261010025253-34f424
<!-- /ignite-progress -->
