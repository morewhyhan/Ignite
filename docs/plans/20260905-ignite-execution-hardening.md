<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-002",
  "release": "ignite-execution-v2",
  "status": "active",
  "outcome": "任何 AI 都只能基于当前代码、当前环境和真实证据完成任务，并能在中断后安全继续",
  "change_type": "存量改动",
  "base_commit": "194ad5348edda95d620061a8d979de275cbc4801",
  "requirements": [
    "REQ-PRODUCT-006",
    "REQ-PRODUCT-007",
    "REQ-PRODUCT-008",
    "REQ-PRODUCT-009",
    "REQ-PRODUCT-010",
    "REQ-PRODUCT-011",
    "REQ-PRODUCT-012",
    "REQ-AUTH-006"
  ],
  "acceptance": [
    {
      "id": "AC-PRODUCT-005",
      "tests": [
        "tests/contracts/ignite-cli.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-006",
      "tests": [
        "tests/contracts/ignite-checks.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-007",
      "tests": [
        "tests/contracts/ignite-runs.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-008",
      "tests": [
        "tests/contracts/ignite-cli.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-009",
      "tests": [
        "tests/contracts/template-runtime.test.ts"
      ]
    },
    {
      "id": "AC-PRODUCT-010",
      "tests": [
        "tests/contracts/docs-traceability.test.ts",
        "tests/contracts/acceptance-runtime.test.ts"
      ]
    },
    {
      "id": "AC-AUTH-005",
      "tests": [
        "tests/contracts/auth-runtime.test.ts",
        "tests/e2e/auth.spec.ts"
      ]
    }
  ],
  "depends_on": [],
  "owner": "template-maintainer",
  "risk": "infrastructure",
  "write_scope": [
    ".ai/",
    ".editorconfig",
    ".gitattributes",
    ".gitignore",
    ".github/",
    ".node-version",
    "AGENTS.md",
    "README.md",
    "docs/",
    "package.json",
    "playwright.config.ts",
    "pnpm-lock.yaml",
    "scripts/",
    "src/server/auth/",
    "tests/",
    "vitest.config.ts"
  ],
  "required_evidence": [
    "check-integration",
    "check-release"
  ],
  "evidence": [
    {
      "id": "check-integration",
      "run_id": "run-20260913075100-fd41df"
    },
    {
      "id": "check-release",
      "run_id": "run-20260913075816-e9d084"
    }
  ],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": "63f350ff4bca56c0e7a17d31e6432ebd38f336a2",
  "updated_at": "2026-09-13"
}
-->

# Ignite 实施计划：AI 执行可靠性加固

## 状态

以顶部元数据为准。

## 目标

把现有执行 CLI 从可用原型升级为不可降级、可追溯、可恢复、跨环境不误复用的模板基础设施，并让 CI 对相同规则负责。

## 非目标

- 不替换 Next.js、Hono、Prisma、Better Auth 或 React Query。
- 不增加任务管理平台、远程队列或外部 SaaS。
- 不重写 Tasks 业务和现有 UI。
- 不迁移历史 legacy Plan。

## 变更类型

- 类型：`[存量改动]`
- 影响的存量路径：执行 CLI、Plan/Release 模板、检查脚本、CI、证据目录和测试标准
- 新增的增量路径：CLI 内部模块、运行时本地目录、执行与追踪契约测试
- 兼容性影响：保留 schema 1 Plan 只读兼容；新 Plan 使用 schema 2
- 数据迁移或回滚要求：不修改业务数据库；回滚时可整体回退本 Plan 的 commit

## 输入规格

- Feature：`docs/features/product.md`
- Standards：`docs/standards/workflow.md`、`testing.md`、`development.md`、`ai-agents.md`
- Designs：`docs/designs/runtime.md`、`api.yaml`、`database.sql`
- Source of truth：`scripts/`、`tests/`、`.github/workflows/ci.yml`

## 已关闭问题

- 开放问题：无；以当前审计发现的虚假完成、风险降级、环境串用和证据污染为实施边界。
- 实施授权：用户已明确要求把 AI 执行逻辑优化到高分。

## 测试与验收设计

| 验收标准       | 先失败的测试或检查                            | 实现后命令                                               | 适用层级       |
| -------------- | --------------------------------------------- | -------------------------------------------------------- | -------------- |
| AC-PRODUCT-005 | 伪造证据、空 commit、过期指纹被旧校验接受     | `pnpm test -- tests/contracts/ignite-cli.test.ts`        | contract       |
| AC-PRODUCT-006 | Prisma、RPC、CSS、Design 和已提交改动可被降级 | `pnpm test -- tests/contracts/ignite-checks.test.ts`     | contract       |
| AC-PRODUCT-007 | 活动 run 返回成功且并发无锁                   | `pnpm test -- tests/contracts/ignite-runs.test.ts`       | contract       |
| AC-PRODUCT-008 | Release 手工状态可与证据冲突                  | `pnpm test -- tests/contracts/ignite-cli.test.ts`        | contract       |
| AC-PRODUCT-009 | 跨平台依赖和验证污染未检测                    | `pnpm test -- tests/contracts/template-runtime.test.ts`  | contract       |
| AC-PRODUCT-010 | REQ、AC、测试和 Design 仅靠人工映射           | `pnpm test -- tests/contracts/docs-traceability.test.ts` | contract       |
| AC-AUTH-005    | 生产启动方式使隔离 E2E 触发认证限流           | `pnpm test -- tests/contracts/auth-runtime.test.ts`      | contract / E2E |

## 实现任务

- [x] 建立 schema 2 Plan、状态转换和自动 Release 推导。
- [x] 基于 base commit 计算真实改动，禁止风险降级并执行统一 diff 检查。
- [x] 建立隔离运行目录、原子锁、环境指纹、心跳和脱敏证据导出。
- [x] 建立 REQ → AC → Test → Run 覆盖校验和 Design 结构校验。
- [x] 固定 WSL/Windows、Node、换行和依赖平台边界。
- [ ] 让测试、状态查询和发布验证保持工作区干净。
- [ ] 将相同规则接入 CI，补齐生产构建 E2E 和移动视口。
- [ ] 从干净副本演练采用、功能检查、中断恢复和发布判定。
- [x] 复核运行时跳过测试的证据判定、取消 Plan 的混合发布，以及检查策略升级后的历史兼容；补充真实双进程锁竞争测试。

## 验收方式

- [x] `pnpm ignite plan validate IGT-002`
- [x] `pnpm ignite check --plan IGT-002 --level integration`：`run-20260913075100-fd41df`，被测提交 `63f350f`。
- [x] `pnpm ignite check --plan IGT-002 --level release`：`run-20260913075816-e9d084`，被测提交 `63f350f`。
- [x] `pnpm docs:check`：包含在上述两次运行中。
- [x] `pnpm check`：2026-09-13 通过，10 个测试文件、60 项测试全部通过。
- [x] `pnpm test:migrations`：新库迁移、重复应用和结构对比通过。
- [x] `pnpm build`：生产构建通过。
- [ ] `pnpm test:e2e`
- [x] `pnpm test:e2e:production`：桌面与移动视口 6 条流程全部通过。
- [x] `git diff --check`

独立副本复验：2026-09-13，在仓库外重新克隆提交 `07f880e`（实现内容为 `63f350f`），重新安装锁定依赖，使用隔离测试环境依次运行 `pnpm verify`、`pnpm test:e2e:production` 和 `node scripts/check-clean.mjs`。60 项测试、迁移、生产构建和桌面/移动共 6 条浏览器流程全部通过，最终输出 `Tracked workspace remained clean.`。此前仓库内副本的 Next.js 外层锁文件提示不作为本次独立复验依据。

## 设计回写

- [ ] 执行状态、证据模型和恢复时序
- [ ] 风险分类与验证矩阵
- [ ] AI 工作台和环境边界
- [ ] 验收追踪和发布推导规则

## 状态记录

| 时间       | 状态   | 说明                                                                        |
| ---------- | ------ | --------------------------------------------------------------------------- |
| 2026-09-05 | active | 完成深度审计，开始加固执行机制                                              |
| 2026-09-06 | active | 完成 schema 2 执行内核、可追踪测试、运行时隔离与 CI 接入                    |
| 2026-09-13 | active | 修复中断重构后的 CLI 入口；验证默认模块生成、旧证据重测与规则文件的输入追踪 |

## 准出条件

- [ ] 所有 AC 有自动化测试和当前输入的运行证据。
- [ ] 伪造、过期、跨环境和仍在运行的证据都不能完成 Plan。
- [ ] Release 只声明范围，状态完全自动推导。
- [ ] 检查无法降级，且提交前后都能得到相同真实改动范围。
- [ ] 并发和中断演练只产生一个有效运行，恢复状态准确。
- [x] 全新副本完成与 release 对应的验证命令后工作区仍然干净；仍需完成其余执行边界审计后才能将 Plan 设为 `done`。
