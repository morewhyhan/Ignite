<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-202611060008",
  "release": "spec-closure-domain-v1",
  "status": "draft",
  "outcome": "任务规则集中到领域层，HTTP 入口只负责编排",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [],
  "verification_contract": 2,
  "binding_contract": 1,
  "content_contract": 1,
  "goals": [
    {
      "text": "任务规则由领域层统一裁决",
      "requirements": [
        "REQ-SPEC-011"
      ]
    }
  ],
  "constraints": [
    "现有 API 测试必须全部保持通过",
    "只新增一个领域文件"
  ],
  "non_goals": [
    "不改 Prisma schema",
    "不改 API 路径与响应形状",
    "不引入 Repository 接口与 DTO",
    "不处理认证域"
  ],
  "authorization": {
    "source": "用户 2026-11-06 指令：补领域层"
  },
  "deliverables": [
    "领域层文件",
    "路由改为编排",
    "领域单元测试",
    "设计回写"
  ],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "21516a5615ecab6da17c25fc86ccd5286b1ee48e",
  "requirements": [
    "REQ-SPEC-011"
  ],
  "acceptance": [
    {
      "id": "AC-SPEC-011",
      "tests": [
        "tests/contracts/task-domain.test.ts::[AC-SPEC-011]"
      ],
      "required_layers": [
        "unit"
      ],
      "checks": [
        {
          "test": "tests/contracts/task-domain.test.ts::[AC-SPEC-011]",
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
      "title": "登记规格与计划并提交基线",
      "phase": "prepare",
      "status": "todo",
      "scope": [
        "docs/plans/20261106-spec-closure-domain.md",
        "docs/plans/releases/spec-closure-domain-v1.json",
        "docs/features/spec-closure-domain.md",
        "tests/contracts/task-domain.test.ts"
      ],
      "result": "计划、发布、规格与测试文件均已登记并提交基线。",
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T2",
      "title": "运行领域规则断言并记录红灯",
      "phase": "red",
      "status": "todo",
      "scope": [
        "tests/contracts/task-domain.test.ts",
        "docs/others/evidence/tdd/"
      ],
      "acceptance": [
        "AC-SPEC-011"
      ],
      "result": "领域规则测试在实现前失败，红灯记录已提交。",
      "depends_on": [],
      "owner": "ignite-executor"
    },
    {
      "id": "T3",
      "title": "抽出领域层并接线路由",
      "phase": "implement",
      "status": "todo",
      "scope": [
        "src/server/domain/task.ts",
        "src/server/api/routes/tasks/index.ts"
      ],
      "acceptance": [
        "AC-SPEC-011"
      ],
      "depends_on": [
        "T2"
      ],
      "result": "路由改为调用领域函数，现有 API 测试全部通过。",
      "owner": "ignite-executor"
    },
    {
      "id": "T4",
      "title": "完成检查与设计回写",
      "phase": "verify",
      "status": "todo",
      "scope": [
        "docs/designs/execution.md",
        "docs/designs/domain.puml"
      ],
      "acceptance": [
        "AC-SPEC-011"
      ],
      "depends_on": [
        "T3"
      ],
      "result": "集成检查通过且设计文档记录了规则位置。",
      "owner": "ignite-executor"
    }
  ],
  "bindings": [
    {
      "id": "BIND-001",
      "source": "REQ-SPEC-011",
      "applicable": "本轮产品要求",
      "status": "met",
      "task": "T3",
      "check": "AC-SPEC-011"
    },
    {
      "id": "BIND-002",
      "source": "AC-SPEC-011",
      "applicable": "本轮验收",
      "status": "missing",
      "task": "T2",
      "check": "AC-SPEC-011"
    },
    {
      "id": "BIND-003",
      "source": "DES-EXEC-101",
      "applicable": "执行设计记录规则",
      "status": "missing",
      "task": "T4",
      "check": "文件检查"
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
  "owner": "ignite-executor",
  "risk": "feature",
  "data_contract": {
    "access_scope": "per-user",
    "access_rationale": "领域函数只接收已认证用户 id 与任务 id，查询必须带 userId 条件。",
    "migration_impact": "none",
    "rollback": "删除领域文件并恢复路由原实现。",
    "destructive_authorization": null
  },
  "write_scope": [
    "docs/plans/20261106-spec-closure-domain.md",
    "docs/plans/releases/spec-closure-domain-v1.json",
    "docs/features/spec-closure-domain.md",
    "tests/contracts/task-domain.test.ts",
    "src/server/domain/task.ts",
    "src/server/api/routes/tasks/index.ts",
    "docs/designs/execution.md",
    "docs/designs/domain.puml",
    "docs/others/evidence/"
  ],
  "tdd_evidence": [],
  "required_evidence": [
    "check-integration"
  ],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-11-06"
}
-->

## 状态

草稿，等待独立草稿审查。
本计划只处理任务领域规则的归属。
审查通过后才进入 ready。
未通过前不实现任何代码。

## 目标

把标题校验、归属校验、更新至少一个字段这三条规则从 HTTP 路由搬进领域层。
路由只做协议适配与编排，不再自行判断规则。
领域函数不接触 Request 与 Response。
行为对外完全不变。

## 原始目标与覆盖核对

用户 2026-11-06 指令要求补齐领域层。
DDD 材料指出没有领域层会让业务规则不一致。
本计划只覆盖任务域一项。
认证域不在本轮范围。

## 整体判断与推进顺序

先抽任务域一个服务，验证行为不变。
有效后再考虑是否推广到其他域。
顺序为规格、红灯、实现、检查、回写。
每一步都保留可回退点。

## 来源规格

docs/features/spec-closure-domain.md 定义 REQ-SPEC-011 与 AC-SPEC-011。
该规格同时约束领域函数入参与失败语义。
规格只写规则，不写实现细节。
规则变更必须先改规格。

## 目标映射

REQ-SPEC-011 由 T3 实现。
AC-SPEC-011 由 T2 取红灯、T3 满足。
设计回写由 T4 完成。
每条绑定都在元数据 bindings 中登记。

## 约束绑定矩阵

三条绑定见元数据 bindings。
绑定逐条对应任务与检查。
矩阵不新增条目。
检查引用指向真实存在的测试标签。

## 主要矛盾

规则现在同时存在于三处。
三处分别是 zod schema、Prisma 约束与路由查询条件。
改一处不会同步另外两处。
领域层只保留一份实现。

## 次要矛盾

测试只能通过 HTTP 观察规则。
因此规则变更必须先改路由。
新增单元测试直接调用领域函数。
这样规则可以先于路由被验证。

## 决策原则

只抽一层，不做 DTO 转换。
不建四层目录，避免千层饼。
行为必须完全不变。
任何改变响应形状的改动都移出本计划。

## 方案比较

方案 A 保留现状，只在文档标注规则位置。
方案 B 抽 TaskService，由路由调用。
方案 C 建完整四层并加 Repository。
A 成本最低但规则仍分散，C 成本过高，选 B。

## 回退

删除 src/server/domain/task.ts 并恢复路由原实现即可。
无数据迁移。
测试文件可保留或一并删除。
回退不影响历史数据。

## 变更类型

存量改动。
不新增模块目录。
不改变对外契约。
只调整规则归属。

## 非目标

不改 Prisma schema。
不改 API 路径与响应形状。
不引入 Repository 接口与 DTO。
不处理认证域。

## 输入规格

REQ-SPEC-011 与 AC-SPEC-011。
docs/designs/execution.md 的分层职责描述。
docs/features/tasks.md 的现有行为描述。
以上三项共同约束本计划。

## 已关闭问题

标题长度沿用 1 到 200。
越权仍返回 404。
更新至少一个字段的规则保留。
以上均不在本计划重新讨论。

## 测试与验收设计

新增 tests/contracts/task-domain.test.ts 直接调用领域函数。
覆盖超长标题、他人任务、空更新三种失败。
现有 API 测试保持不动。
它们作为行为未变的证据。

## 实现任务

T1 登记并提交基线。
T2 取红灯。
T3 抽领域层并接线。
T4 检查与回写。

## 验收方式

check --plan IGT-202611060008 --level integration 必须退出码为零。
现有 API 测试必须全部仍通过。
新增单元测试必须覆盖三类失败。
三条同时满足才算通过。

## 设计回写

在 docs/designs/execution.md 记录任务规则位于领域层。
在 domain.puml 标注聚合边界。
回写内容只写位置与边界。
不重复字段清单。

## 状态记录

2026-11-06 创建计划。
同日补齐规格、发布与任务字段。
等待独立草稿审查。
审查通过后转入 ready。

## 准出条件

集成检查通过。
交付审查通过。
无新增失败测试。
账本对应条目可回填。
