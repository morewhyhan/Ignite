<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-000",
  "release": "release-id",
  "status": "draft",
  "outcome": "完成后谁能多做哪件事",
  "change_type": "新增模块",
  "base_commit": "运行 git rev-parse HEAD 后替换为 40 位 commit",
  "requirements": ["REQ-FEATURE-001"],
  "acceptance": [
    {
      "id": "AC-FEATURE-001",
      "tests": ["tests/path/file.test.ts::[AC-FEATURE-001] 用例名"]
    }
  ],
  "depends_on": [],
  "owner": "assigned-worker",
  "risk": "feature",
  "write_scope": [
    "src/modules/<feature-name>/",
    "src/server/api/routes/<feature-name>/",
    "src/server/api/index.ts",
    "src/app/",
    "src/config/navigation.ts",
    "prisma/",
    "tests/",
    "docs/features/<feature-name>.md",
    "docs/plans/YYYYMMDD-<change-name>.md",
    "docs/plans/releases/<release-id>.json",
    "docs/designs/",
    "docs/others/test-cases/"
  ],
  "required_evidence": ["check-integration", "check-release"],
  "evidence": [],
  "blocker": null,
  "open_questions": ["需要关闭的问题"],
  "integrated_commit": null,
  "updated_at": "YYYY-MM-DD"
}
-->

# Ignite 实施计划：<change-name>

> 复制本文件到 `docs/plans/YYYYMMDD-<change-name>.md`。计划只记录一次任务的过程；完成后保留，最终事实回写 `docs/designs/`。

## 状态

以顶部元数据的 `status` 为唯一状态，不在正文维护第二份状态。新建时为 `draft`；关闭问题后依次进入 `ready`、`active`、`verifying`、`done`。

## 目标

## 非目标

-

## 变更类型

- 类型：只保留一个：`[新增模块]` 或 `[存量改动]`；基础设施调整属于存量改动，并用 `risk` 表达风险。
- 影响的存量路径：
- 新增的增量路径：
- 兼容性影响：
- 数据迁移或回滚要求：

## 输入规格

- Feature：`docs/features/<feature-name>.md`
- Standards：`docs/standards/` 中受影响的规范
- Designs：`docs/designs/` 中受影响的当前设计
- Source of truth：`src/`、`prisma/`、`tests/`

## 已关闭问题

- 开放问题：无 / 列出问题及用户确认结论
- 实施授权：用户已明确要求实施 / 等待确认

## 测试与验收设计

| 验收标准     | 覆盖需求        | 自动化测试（含 `[AC-*]` 标记） | 实现后命令 | 适用层级                    |
| ------------ | --------------- | ------------------------------ | ---------- | --------------------------- |
| AC-FEATURE-1 | REQ-FEATURE-001 |                                |            | API / contract / E2E / unit |

## 实现任务

- [ ] 任务 1
- [ ] 任务 2

## 验收方式

- [ ] 目标测试先按预期失败，而不是配置或语法错误
- [ ] `pnpm ignite check --plan IGT-000 --level integration`
- [ ] `pnpm ignite plan set-status IGT-000 verifying --commit HEAD`
- [ ] `pnpm ignite check --plan IGT-000 --level release`
- [ ] `pnpm ignite plan set-status IGT-000 done`

## 设计回写

- [ ] 领域模型
- [ ] 数据库
- [ ] API
- [ ] 时序图
- [ ] 专题设计

## 状态记录

| 时间       | 状态  | 说明                   |
| ---------- | ----- | ---------------------- |
| YYYY-MM-DD | draft | 建立计划并等待关闭问题 |

## 准出条件

- [ ] 每条 REQ 均被 AC 覆盖，每条 AC 均映射到带 `[AC-*]` 标记的自动化测试。
- [ ] 工作区实现已提交，`integrated_commit` 是真实且可追溯的 commit。
- [ ] 所有 `required_evidence` 指向当前输入、当前环境且通过的 schema 2 证据。
- [ ] 当前设计已回写，Plan 状态已由 CLI 更新为 `done`。
