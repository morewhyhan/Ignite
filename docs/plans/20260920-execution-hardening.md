<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-005",
  "release": "execution-hardening-v1",
  "status": "active",
  "outcome": "交付干净、已验收的通用模板，AI 可从脚手架持续推进到真实验收与交接",
  "contract_version": 2,
  "execution_contract": 1,
  "goals": [
    {
      "text": "原始目标完整映射，延期不等于排除",
      "requirements": [
        "REQ-EXECUTION-001"
      ]
    },
    {
      "text": "验收区分模拟、真实数据库、浏览器和外部集成",
      "requirements": [
        "REQ-EXECUTION-002"
      ]
    },
    {
      "text": "发布逐计划计算有效证据缺口",
      "requirements": [
        "REQ-EXECUTION-003"
      ]
    },
    {
      "text": "任务状态只维护一份机器源",
      "requirements": [
        "REQ-EXECUTION-004"
      ]
    },
    {
      "text": "稳定契约允许并行开发，最终依赖约束完成",
      "requirements": [
        "REQ-EXECUTION-005"
      ]
    },
    {
      "text": "共享文件明确负责人和交接信息",
      "requirements": [
        "REQ-EXECUTION-006"
      ]
    },
    {
      "text": "迁移夹具可扩展，示例可移除",
      "requirements": [
        "REQ-EXECUTION-007"
      ]
    },
    {
      "text": "跨平台指纹一致，公共检查可复用",
      "requirements": [
        "REQ-EXECUTION-008"
      ]
    },
    {
      "text": "脚手架与真实验收层级一致，模板目录只保留当前基线",
      "requirements": [
        "REQ-EXECUTION-009"
      ]
    },
    {
      "text": "下一步指引能够从开发持续推进到验收完成",
      "requirements": [
        "REQ-EXECUTION-010"
      ]
    }
  ],
  "constraints": [
    "本轮按用户最新要求完成必要测试与模板基线验收",
    "不将未验证改动标记为done",
    "保留历史的 Git 可追溯性，模板目录只保留当前交付记录"
  ],
  "non_goals": [
    "补齐苍穹外卖全部课程业务",
    "推送远端或部署"
  ],
  "authorization": {
    "source": "用户先要求修复八类问题；2026-09-23进一步要求优化到可直接开发的完整模板版本，并删除仓库中的试开发项目，授权完成最终验收"
  },
  "deliverables": [
    "scripts/ignite/",
    "docs/standards/workflow.md",
    "docs/designs/execution.md"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "099d3cffc215fd38d4e59e26d40942b1f0c39413",
  "requirements": [
    "REQ-EXECUTION-001",
    "REQ-EXECUTION-002",
    "REQ-EXECUTION-003",
    "REQ-EXECUTION-004",
    "REQ-EXECUTION-005",
    "REQ-EXECUTION-006",
    "REQ-EXECUTION-007",
    "REQ-EXECUTION-008",
    "REQ-EXECUTION-009",
    "REQ-EXECUTION-010"
  ],
  "acceptance": [
    {
      "id": "AC-EXECUTION-001",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-001]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-001]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-002",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-002]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-002]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-003",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-003]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-003]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-004",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-004]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-004]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-005",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-005]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-005]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-006",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-006]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-006]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-007",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-007]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-007]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-008",
      "tests": [
        "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-008]",
        "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-008]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/execution-hardening.test.ts::[AC-EXECUTION-008]",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/ignite-cli.test.ts::[AC-EXECUTION-008]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-009",
      "tests": [
        "tests/contracts/template-runtime.test.ts::[AC-EXECUTION-009]",
        "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-009]",
        "tests/contracts/template-history.test.ts::[AC-EXECUTION-009]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/template-runtime.test.ts::[AC-EXECUTION-009]",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-reliability.test.ts::[AC-EXECUTION-009]",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/template-history.test.ts::[AC-EXECUTION-009]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-010",
      "tests": [
        "tests/contracts/ignite-next.test.ts::[AC-EXECUTION-010]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/ignite-next.test.ts::[AC-EXECUTION-010]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": [
    "unit"
  ],
  "tasks": [
    {
      "id": "T1",
      "title": "原始目标完整映射，延期不等于排除",
      "status": "doing"
    },
    {
      "id": "T2",
      "title": "验收区分模拟、真实数据库、浏览器和外部集成",
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "发布逐计划计算有效证据缺口",
      "status": "doing"
    },
    {
      "id": "T4",
      "title": "任务状态只维护一份机器源",
      "status": "doing"
    },
    {
      "id": "T5",
      "title": "稳定契约允许并行开发，最终依赖约束完成",
      "status": "doing"
    },
    {
      "id": "T6",
      "title": "共享文件明确负责人和交接信息",
      "status": "doing"
    },
    {
      "id": "T7",
      "title": "迁移夹具可扩展，示例可移除",
      "status": "doing"
    },
    {
      "id": "T8",
      "title": "跨平台指纹一致，公共检查可复用",
      "status": "doing"
    },
    {
      "id": "T9",
      "title": "执行集成、发布与采用验证，清理试开发项目并刷新当前基线",
      "status": "todo"
    },
    {
      "id": "T10",
      "title": "对齐新模块的验收层级并提供无写入脚手架预览",
      "status": "doing"
    },
    {
      "id": "T11",
      "title": "修复 next 推进、旧失败和历史证据兼容性",
      "status": "doing"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "owner": "root",
  "risk": "infrastructure",
  "write_scope": [
    "AGENTS.md",
    "scripts/",
    "tests/",
    "docs/",
    ".gitattributes",
    "README.md"
  ],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [
      "tests/contracts/execution-hardening.test.ts"
    ],
    "remaining": []
  },
  "required_evidence": [
    "check-integration",
    "check-release"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-09-24"
}
-->

# AI 执行流程加固

## 状态

以顶部元数据和生成摘要为准；本轮完成必要验收后才进入 done。

## 变更类型

- 类型：`[存量改动]`

## 目标

落实八类审计问题的针对性修复，补齐脚手架与下一步执行体验，交付只携带当前基线记录的通用模板；原始目标覆盖见 release scope。

## 原始目标与覆盖核对

| 原始目标或来源                             | 本轮处理                                                                                                                     | REQ / AC                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 用户要求修复采用实测中的八类问题           | 按目标覆盖、验收分层、证据、任务状态、依赖、共享文件、夹具和指纹逐项实现                                                     | EXECUTION-001 至 EXECUTION-008    |
| 用户要求本轮优化成可直接开发的完整基础模板 | 对齐脚手架、接续指引，完成集成、迁移、生产构建与浏览器验收                                                                   | EXECUTION-009 / EXECUTION-010；T9 |
| 用户要求删除仓库中的试开发项目             | `.ignite/cangqiong-takeout` 已移出仓库，可从系统临时目录恢复；当前发布仅保留本次 Plan、Release 与证据，旧记录仍可由 Git 恢复 | EXECUTION-009；T9                 |

## 输入规格

- Feature：`docs/features/execution.md`
- Standards：`docs/standards/workflow.md`、`docs/standards/testing.md`

## 实现任务

tasks 为唯一任务进度，使用 CLI 更新。

## 非目标

不在本轮补齐苍穹外卖课程业务。

## 测试与验收设计

八项契约回归用例对应八项 AC，补充脚手架采用与执行推进的回归场景；统一完成集成和生产构建浏览器验收。

## 验收方式

在 WSL/Linux、Node 24.19.0 下执行 integration/release，证据绑定实际提交。试开发项目位于被忽略的 `.ignite/cangqiong-takeout`，已移出仓库至系统临时恢复目录；模板业务源码保持通用基线。

## 状态记录

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [ ] T1 · 原始目标完整映射，延期不等于排除 · doing
- [ ] T2 · 验收区分模拟、真实数据库、浏览器和外部集成 · doing
- [ ] T3 · 发布逐计划计算有效证据缺口 · doing
- [ ] T4 · 任务状态只维护一份机器源 · doing
- [ ] T5 · 稳定契约允许并行开发，最终依赖约束完成 · doing
- [ ] T6 · 共享文件明确负责人和交接信息 · doing
- [ ] T7 · 迁移夹具可扩展，示例可移除 · doing
- [ ] T8 · 跨平台指纹一致，公共检查可复用 · doing
- [ ] T9 · 执行集成、发布与采用验证，清理试开发项目并刷新当前基线 · todo
- [ ] T10 · 对齐新模块的验收层级并提供无写入脚手架预览 · doing
- [ ] T11 · 修复 next 推进、旧失败和历史证据兼容性 · doing

验收缺口：未记录；完成仍须实际证据
证据：尚无
<!-- /ignite-progress -->

2026-09-20：用户授权修改，明确暂不测试。
2026-09-23：补齐实现与回归资产；按用户要求，测试和检查仍待后续授权执行。
2026-09-23：用户要求本轮完成可直接采用的最终模板，恢复必要验证；修复脚手架验收层级、流程指引和历史证据兼容问题，清理试开发项目。
2026-09-24：77 项针对性回归通过；首次完整集成在格式检查发现生成进度块缺少空行，已修复生成器并补格式幂等回归，重新进行集成验收。

## 设计回写

`docs/designs/execution.md` 记录变更后的当前实现及未验证边界。

## 准出条件

所有实际验收、scope目标和有效证据齐备后才能done。
