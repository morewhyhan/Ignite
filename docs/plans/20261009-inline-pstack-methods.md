<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791497468917571676",
  "release": "inline-pstack-methods-v1",
  "status": "active",
  "outcome": "技能和流程直接使用本项目文档与宿主能力，无需额外适配文件",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "删除独立适配文件，将必要内容直接写回所属技能与流程",
      "requirements": ["REQ-PSTACK-003"]
    }
  ],
  "constraints": [
    "保留51个技能、23个流程及MIT来源",
    "保留唯一文档真源和两个技能发现桥接",
    "由用户启用poteto-mode，再由AI选择流程与技能"
  ],
  "non_goals": [
    "不新增自动调度器或替代适配说明",
    "不评估模型耗时或准确率",
    "不改业务代码或发布远程变更"
  ],
  "authorization": {
    "source": "用户2026-10-09要求不单列适配文件，直接删改对应内容"
  },
  "deliverables": [".ai/pstack/skills/", "scripts/pstack-sync.mjs", "AGENTS.md"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "6d022dbedc1d00fcca7dddfbd1cb5eadb0ff0bdc",
  "requirements": ["REQ-PSTACK-003"],
  "acceptance": [
    {
      "id": "AC-PSTACK-003",
      "tests": [
        "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-003] reads inherited methods and discovery bridges without an adapter prerequisite",
        "tests/contracts/pstack-sync.test.ts::[AC-PSTACK-003] synchronizes canonical project skills without overwriting user skills or mutating read-only checks"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-003] reads inherited methods and discovery bridges without an adapter prerequisite",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/pstack-sync.test.ts::[AC-PSTACK-003] synchronizes canonical project skills without overwriting user skills or mutating read-only checks",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "识别现有行为、写入边界和原始目标",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "补充需求和目标行为测试",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "实施最小存量修改",
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "验证兼容性并回写设计",
      "status": "todo"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": ".ai/pstack/skills/",
      "owner": "root",
      "mode": "integrator"
    }
  ],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "access_scope": "not-decided",
    "access_rationale": "",
    "migration_impact": "not-decided",
    "rollback": "",
    "destructive_authorization": null
  },
  "write_scope": [
    ".ai/",
    ".agents/skills/",
    ".claude/skills/",
    "AGENTS.md",
    "scripts/pstack-sync.mjs",
    "tests/contracts/pstack-assets.test.ts",
    "tests/contracts/pstack-sync.test.ts",
    "docs/features/pstack-methods.md",
    "docs/designs/execution.md",
    "docs/plans/20261009-inline-pstack-methods.md",
    "docs/plans/releases/inline-pstack-methods-v1.json",
    "docs/others/evidence/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-PSTACK-003",
      "test": "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-003] reads inherited methods and discovery bridges without an adapter prerequisite",
      "run_id": "tdd-20261008221303-5b8f70"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-08"
}
-->

# Ignite 实施计划：移除方法适配中间层

## 原始目标与覆盖核对

| 用户原话                             | 本轮目标                                 | REQ            | AC            | 处理             |
| ------------------------------------ | ---------------------------------------- | -------------- | ------------- | ---------------- |
| 不单独列适配文件，该删的删，该改的改 | 删除前置层，直接修正技能、流程和生成入口 | REQ-PSTACK-003 | AC-PSTACK-003 | 纳入             |
| 遵照原项目使用方式                   | 用户启用模式，AI选择方法                 | REQ-PSTACK-003 | AC-PSTACK-003 | 纳入文案人工核对 |

## 整体判断与推进顺序

当前所有继承Markdown和生成入口都要求先读ADAPTER，已有许多技能正文已经采用原生Plan。先记录对真实资产和入口生成器的断言红灯，再删除统一前置说明并将剩余必要映射就地写入。子Agent分别修改技能正文和流程指南，根Agent负责批量前缀、注册入口、生成器和整合，不共同修改正文。文案逐项审查，结构断言不声称证明模型效果。移除引用、保留正文真源且同步器无需适配文件时结束实现，再执行项目要求的工程与Release检查。

## 输入规格与回滚

本轮为存量改动，依据docs/features/pstack-methods.md、docs/designs/execution.md和AGENTS.md。无业务数据影响，回退本轮Git变更即可。不新增适配文件或平行账本，不改模型实验和业务功能。

## 测试与验收设计

AC-PSTACK-003在真实仓库检查入口和方法没有额外适配依赖，在临时项目运行实际同步器，核对正文链接、用户文件保护、只读检查和幂等同步。保留AC-PSTACK-001/002来源与链接回归。人工复查具体文档归属、可用工具、权限、模型配置和手动启用模式。

## 设计回写与准出

将实际结构回写docs/designs/execution.md。检查证据记录在原生Plan/Release，不把结构通过表述为所有宿主或模型行为已验收。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 识别现有行为、写入边界和原始目标 · done
- [x] T2 · 补充需求和目标行为测试 · done
- [ ] T3 · 实施最小存量修改 · todo
- [ ] T4 · 验证兼容性并回写设计 · todo

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->
