<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791362215382691296",
  "release": "agent-optimization-v1",
  "status": "active",
  "outcome": "项目完整携带pstack方法与技能，并以同一真源接入各工具、适配Ignite规则和实际宿主",
  "contract_version": 2,
  "execution_contract": 1,
  "verification_contract": 2,
  "goals": [
    {
      "text": "完整搬入全部方法、技能、资源并保留来源许可",
      "requirements": ["REQ-PSTACK-001"]
    },
    {
      "text": "项目内技能发现与调用入口指向同一真源",
      "requirements": ["REQ-PSTACK-002"]
    },
    {
      "text": "适配项目真源、宿主工具模型与授权，按任务规模调用",
      "requirements": ["REQ-PSTACK-003"]
    }
  ],
  "constraints": [
    "保留全部164个上游文件和MIT许可",
    "AGENTS与docs各专业真源优先",
    "项目内桥接不复制长期规则",
    "不改业务代码、数据库、依赖与用户全局配置"
  ],
  "non_goals": [
    "技能提速KPI、重复模型对照与跑分",
    "真实双Worker演练与调度器建设",
    "自动启用Benny/云服务/外部集成",
    "推送、合并、部署或外部消息"
  ],
  "authorization": {
    "source": "2026-10-08用户要求整套方法论、技能直接搬到当前项目并适配；明确纠正此前技能跑分偏航；2026-10-08用户授权把审计发现全部修正"
  },
  "deliverables": [
    ".ai/pstack/",
    ".agents/skills/",
    ".claude/skills/",
    ".cursor/skills/",
    ".opencode/skills/",
    "AGENTS.md",
    ".ai/README.md",
    "docs/features/pstack-methods.md",
    "docs/designs/execution.md"
  ],
  "remaining_work": [
    "原生integration run-20261007224919-ba4dba：AC-PSTACK-001/002/003及176项回归通过，旧AC-PRODUCT-013变异测试的子进程25秒超时；单独复现同样结果，未宣称完整通过，需定位后再验收",
    "原迁移未建立TDD红灯，不能补写历史或标记Plan done；Release尚未验收"
  ],
  "change_type": "存量改动",
  "base_commit": "542ea1c4dba5a0468230970f8158093a2f97c7dc",
  "requirements": ["REQ-PSTACK-001", "REQ-PSTACK-002", "REQ-PSTACK-003"],
  "acceptance": [
    {
      "id": "AC-PSTACK-001",
      "requirements": ["REQ-PSTACK-001"],
      "tests": ["tests/contracts/pstack-assets.test.ts::[AC-PSTACK-001]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-001]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-PSTACK-002",
      "requirements": ["REQ-PSTACK-002"],
      "tests": ["tests/contracts/pstack-assets.test.ts::[AC-PSTACK-002]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-002]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-PSTACK-003",
      "requirements": ["REQ-PSTACK-003"],
      "tests": ["tests/contracts/pstack-assets.test.ts::[AC-PSTACK-003]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/pstack-assets.test.ts::[AC-PSTACK-003]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "更新本轮目标与采用边界，停止技能跑分前置要求",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "搬入完整pstack及来源许可、配置和适配层",
      "status": "done"
    },
    {
      "id": "T3",
      "title": "连接四种项目技能发现目录与通用规则入口",
      "status": "done"
    },
    {
      "id": "T4",
      "title": "检查迁移文件完整性、入口和引用，回写事实及限制",
      "status": "done"
    },
    {
      "id": "T5",
      "title": "逐项修正审计发现的记录、规划、技能维护、模型与Benny入口",
      "status": "done"
    },
    {
      "id": "T6",
      "title": "修正辅助脚本边界并同步四宿主入口与来源哈希",
      "status": "done"
    },
    {
      "id": "T7",
      "title": "检查本轮实际改动并回写Design、采用边界与验收限制",
      "status": "done"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": ["项目内pstack技能真源与跨工具桥接"],
    "migrations": [],
    "tests": ["静态完整性、元数据与链接检查；不证明模型效果"],
    "remaining": [
      "原生integration run-20261007224919-ba4dba：AC-PSTACK-001/002/003及176项回归通过，旧AC-PRODUCT-013变异测试的子进程25秒超时；单独复现同样结果，未宣称完整通过，需定位后再验收",
      "原迁移未建立TDD红灯，不能补写历史或标记Plan done；Release尚未验收"
    ]
  },
  "owner": "codex",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "方法与文档资产，不涉及业务用户数据",
    "migration_impact": "none",
    "rollback": "回退本次方法、桥接和文档提交，不改变数据库",
    "destructive_authorization": null
  },
  "write_scope": [
    ".ai/",
    ".agents/skills/",
    ".claude/skills/",
    ".cursor/skills/",
    ".opencode/",
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/rules/ignite.mdc",
    ".github/copilot-instructions.md",
    "docs/features/pstack-methods.md",
    "docs/plans/20261007-agent-capabilities.md",
    "docs/plans/releases/agent-optimization-v1.json",
    "docs/designs/execution.md",
    "docs/standards/ai-agents.md",
    "docs/standards/adoption.md",
    "docs/others/ignite-status.md",
    "tests/contracts/pstack-assets.test.ts",
    "package.json",
    "tsconfig.json",
    "eslint.config.mjs",
    ".prettierignore",
    "scripts/pstack-sync.mjs",
    "tests/contracts/pstack-sync.test.ts"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-07"
}
-->

# Ignite 实施计划：pstack整套迁移

## 原始目标与覆盖核对

| 用户原话 / 来源                  | 结果                                         | REQ            | AC            | 处理         |
| -------------------------------- | -------------------------------------------- | -------------- | ------------- | ------------ |
| 整套方法论和技能都搬到当前项目   | 携带上游全部文件及许可                       | REQ-PSTACK-001 | AC-PSTACK-001 | 纳入         |
| 克隆仓库后技能能被发现和调用     | 项目发现目录桥接同一真源，通用AGENTS兜底入口 | REQ-PSTACK-002 | AC-PSTACK-002 | 纳入         |
| 对自己的东西做恰当适配           | Ignite规则、宿主工具模型、授权与任务尺度映射 | REQ-PSTACK-003 | AC-PSTACK-003 | 纳入         |
| 不再做无必要的技能测试、耗时跑分 | 不启动模型实验，不以效果证明阻挡复制与使用   | 全部           | 全部          | 用户明确纠偏 |

## 整体判断与推进顺序

本轮交付为完整方法资产与实际入口，不是评估研究。先复制全部上游文件，再用单一适配层明确冲突处理，生成各工具发现桥接，检查文件完整、路径可达和许可保留。已有业务代码、依赖与数据库不变；复杂任务才使用poteto-mode，日常明确小改动直接执行。

只检查迁移资产及入口，不运行模型对照，不建设Worker调度器。本轮已找到WSL Node 24.19.0，runtime:check通过；使用该环境检查，不重装依赖。本轮通过原生CLI进入active；原迁移缺少TDD红灯，不补写历史，integration按实际运行回填，Release保持未完成，资产交付与工程正式完成分开报告。没有占位失败测试或虚假验收证据。

此前同ID计划在观察分支记录模型试验；历史保留，不把它们搬入模板或宣称证明本次迁移。用户本轮改变了交付范围，本次元数据按此接续，不新增收口Plan。

## 输入规格

规格见[方法迁移](../features/pstack-methods.md)，真源见[pstack适配](../../.ai/pstack/ADAPTER.md)，当前事实回写[执行设计](../designs/execution.md)。技能的工程流程映射到项目原有Plan/tasks与专业真源，不建立并行任务台账。

## 准出条件

静态检查证明资产和引用完整，不证明真实模型使用效果、所有平台的实时技能刷新、外部MCP或Benny集成。Plan/Release未获正式通过，不设done。用户明确本轮不开展技能模型实验；后续工程验收须使用正确平台依赖。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] T1 · 更新本轮目标与采用边界，停止技能跑分前置要求 · done
- [x] T2 · 搬入完整pstack及来源许可、配置和适配层 · done
- [x] T3 · 连接四种项目技能发现目录与通用规则入口 · done
- [x] T4 · 检查迁移文件完整性、入口和引用，回写事实及限制 · done
- [x] T5 · 逐项修正审计发现的记录、规划、技能维护、模型与Benny入口 · done
- [x] T6 · 修正辅助脚本边界并同步四宿主入口与来源哈希 · done
- [x] T7 · 检查本轮实际改动并回写Design、采用边界与验收限制 · done

验收缺口：原生integration run-20261007224919-ba4dba：AC-PSTACK-001/002/003及176项回归通过，旧AC-PRODUCT-013变异测试的子进程25秒超时；单独复现同样结果，未宣称完整通过，需定位后再验收；原迁移未建立TDD红灯，不能补写历史或标记Plan done；Release尚未验收
证据：尚无
<!-- /ignite-progress -->

## 状态

顶部元数据与CLI派生进度为状态真源。当前资产已落地，正式工程验收未成立。

## 目标

让完整克隆Ignite的采用者携带整套pstack方法及对应项目技能入口，按适配使用。

## 变更类型

- 类型：`[存量改动]`

只增加工作台方法和发现入口，业务代码与数据库不变；回滚本次文件提交即可。

## 非目标

按顶部non_goals执行，不开展技能跑分、模型效果实验、Worker演练或自动启用外部集成。

## 实现任务

任务状态由顶部tasks保存，使用原生CLI更新并生成进度，不另建状态副本。

## 测试与验收设计

本轮只做文件完整性、元数据、许可和链接检查，不能冒充模型效果或平台实际运行。迁移资产的三项unit映射已补齐，尚无TDD红灯和原生integration，Plan保留draft，不伪造红灯或完成证据。

## 验收方式

使用技能官方元数据校验器、逐文件哈希核对、项目文档结构和链接检查。宿主实际发现/调用及原生Plan integration/Release未运行；正确平台依赖准备后才能声明相应正式层级通过。

## 设计回写

实际资产、入口、适配及限制已写入docs/designs/execution.md，采用边界写入docs/standards/adoption.md。

## 状态记录

2026-10-08用户明确要求整套搬移，取消技能跑分前置方向。本轮改回文件与入口交付，不从历史对照试验生成收益结论。

2026-10-08静态迁移检查：270个技能元数据合法；文件哈希匹配；三项资产unit检查实际通过（392ms），仅使用隔离Windows工具读取当前项目文件。项目文档检查通过，使用进程内TypeScript/YAML纯JS解析器，不更改主工作区依赖。原生runtime:check因Linux依赖拒绝Windows，原始直接docs检查也因缺失TypeScript失败，均未冒充通过。Benny可选资源从根TypeScript/lint/format中排除，避免主应用承担其独立依赖。

## 2026-10-08审计修复

接续同一结果：把决策、阶段计划、协作和验证地图接回原生真源；新技能维护canonical并同步四入口；模型配置由实际执行入口读取；辅助工具不隐式安装或删除；Benny固定真源、保持未启用。采用边界不扩大到机器人上线、模型效果或四平台实机运行。新增同步脚本只维护生成文件，不覆盖用户技能、不建立任务账本。

本轮检查准备：WSL运行时通过；504个方法本地引用有效；同步脚本的新增/四入口/只读/冲突保护/来源pin保留行为检查通过。第一次文件哈希检查遇并行编辑变动，待全部写入完成后重新同步。原生检查确认本轮应为integration；先提交稳定输入再运行，未提交输入拒绝未产生通过证据。

## 审计修复交付与实际检查

被测版本 `f85caac49d50b325d2bbe7037b3ee00d3d071154`。审计中的记录、阶段计划、协调、验证地图、新技能维护、模型读取、实际路径、观察状态、辅助工具环境和Benny入口均已修改；原164份资产及许可保留，四端入口同步。504个本地方法引用无缺失；新增同步工具的四入口、只读、幂等与冲突保护行为通过。

原生运行 `run-20261007224919-ba4dba` 的差异、template doctor、治理、文档、类型、lint和格式检查通过，AC-PSTACK-001/002/003通过。全库单元回归176项通过，1项旧Tasks权限变异测试失败：目标子进程达到25秒预算后未产出目标断言。单独再运行同一测试仍失败；超时原因未定位，不按猜测改正确断言或机械第三次运行。原生integration整体未通过，未生成通过证据，Release未运行。文件适配交付不能冒充正式发布完成。

同版本单独运行 pnpm test:migrations 通过：当前仅初始迁移，0个真实升级边界、5张有数据的表；这是数据库基线冒烟检查，不能证明新Schema升级或生产迁移。

入口完整性检查限定上游清单中的54个技能，新增项目技能不会被误当作上游数量错误；新增技能的四端生成、只读与冲突保护仍由同步工具行为夹具验证。
