<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791535498797266205",
  "release": "method-recovery-v1",
  "status": "active",
  "outcome": "错误技能路径自动恢复，并在实施任务开始前检查对应真实红灯",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-001", "REQ-METHOD-002", "REQ-METHOD-003"],
      "text": "优化已观察到的技能路径错误和执行顺序错误"
    }
  ],
  "constraints": ["沿用原文档与原生检查器", "WSL Ubuntu/NVM Node 24.19.0", "不改业务产品功能"],
  "non_goals": ["完整学生系统开发", "保证所有模型一定遵守说明"],
  "authorization": {
    "source": "用户：对着这个问题，把它实际优化下来"
  },
  "deliverables": ["项目技能读取命令", "带阶段的任务契约与实施前置检查"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "153b8ad131cd214760ef9b8948e16755004560af",
  "requirements": ["REQ-METHOD-001", "REQ-METHOD-002", "REQ-METHOD-003"],
  "acceptance": [
    {
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-001]"
        }
      ],
      "tests": ["tests/contracts/method-recovery.test.ts::[AC-METHOD-001]"],
      "id": "AC-METHOD-001"
    },
    {
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-002]"
        }
      ],
      "tests": ["tests/contracts/method-recovery.test.ts::[AC-METHOD-002]"],
      "id": "AC-METHOD-002"
    },
    {
      "required_layers": ["unit"],
      "checks": [
        {
          "layer": "unit",
          "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-003]"
        }
      ],
      "tests": ["tests/contracts/method-recovery.test.ts::[AC-METHOD-003]"],
      "id": "AC-METHOD-003"
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "status": "done",
      "title": "确认规则与真实行为测试",
      "id": "T1"
    },
    {
      "status": "done",
      "title": "记录三个 AC 的真实红灯",
      "id": "T2"
    },
    {
      "status": "todo",
      "title": "实施路径恢复与任务前置约束",
      "id": "T3"
    },
    {
      "status": "todo",
      "title": "验证、回写事实设计和采用边界",
      "id": "T4"
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
    "access_rationale": "仅工程命令与方法入口，不访问业务数据",
    "migration_impact": "none",
    "rollback": "回滚本轮工程改动，不涉及业务数据迁移",
    "destructive_authorization": null
  },
  "write_scope": [
    "AGENTS.md",
    ".ai/",
    "scripts/",
    "tests/contracts/",
    "docs/features/ai-execution-trust.md",
    "docs/plans/",
    "docs/standards/",
    "docs/designs/",
    "docs/others/evidence/tdd/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-METHOD-001",
      "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-001]",
      "run_id": "tdd-20261009084846-a81fbe"
    },
    {
      "acceptance_id": "AC-METHOD-002",
      "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-002]",
      "run_id": "tdd-20261009084909-8e6fdd"
    },
    {
      "acceptance_id": "AC-METHOD-003",
      "test": "tests/contracts/method-recovery.test.ts::[AC-METHOD-003]",
      "run_id": "tdd-20261009084919-b6abc2"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-09"
}
-->

# Ignite 实施计划：方法读取与执行顺序纠偏

## 原始目标与覆盖核对

用户要求实际优化上一轮发现的两个错误。路径恢复对应 REQ-METHOD-001 / AC-METHOD-001；任务顺序与实施前置条件对应 REQ-METHOD-002、003 / AC-METHOD-002、003。使用 WSL/NVM，保留原生文档真源和历史兼容，不开发学生产品，不承诺所有宿主模型都可靠执行。

## 整体判断与推进顺序

实际试验把 r9 当成目录且读取失败未恢复，又在已经读到先测试要求后把红灯排在实施之后。本轮先提交 CLI 行为断言并逐 AC 记录红灯，再实现当前项目技能读取及任务阶段、证据检查。宿主目录表不能由模板控制；项目命令降低路径猜测，原生状态转换阻止缺证据的实施状态。直接越过 CLI 写源码仍是宿主行为边界，不能宣称模板能拦截任意文件写入。

## 测试与验收设计

三个 AC 使用 tests/contracts/method-recovery.test.ts 的实际 CLI 或校验入口，覆盖错误地址恢复、真源缺失、逆序任务、缺证据拒绝、不修改被拒 Plan、有证据放行和伪造记录拒绝。按原生 tdd red 记录后实现，再运行 Plan integration。最终 Release 依项目规则验证组合版本。

## 设计回写

docs/designs/architecture.md 记录当前技能命令与任务契约；docs/standards/adoption.md 记录模板自动触发和宿主执行的采用边界。

## 状态记录

2026-10-09：依据实际试验建立存量 Plan，未实施前提交行为断言，保持实现和验证任务待办。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 确认规则与真实行为测试 · done
- [x] T2 · 记录三个 AC 的真实红灯 · done
- [ ] T3 · 实施路径恢复与任务前置约束 · todo
- [ ] T4 · 验证、回写事实设计和采用边界 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
