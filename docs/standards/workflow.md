# 规格驱动开发工作流

本文档把 Ignite 的需求规格、Plan/Go、测试先行和 E2E 闭环转化为可执行流程。工具可以替换，闭环不能省略。`pnpm ignite` 是状态、检查和证据的统一入口。

## 0. 任务单位和状态机

一个 Plan 必须对应一个可独立验收、集成和回滚的交付结果。实现、测试修复、格式修复和设计回写是这个 Plan 的子任务；没有事实变化的状态同步不能单独开 Plan。

新 Plan 在顶部使用 `ignite-plan` JSON 元数据，状态只能按下面的有限集合使用：

```text
draft → ready → active → verifying → done
                    ├→ blocked → active
                    ├→ cancelled
                    └→ superseded
```

`done` 必须有所有 `required_evidence` 的 schema 2 `passed` 证据、当前输入指纹和真实集成 commit；`blocked` 必须说明缺什么、责任方、恢复动作；`legacy_unverified` 只用于历史 Plan，不代表完成。用 `pnpm ignite plan validate` 检查结构，用 `pnpm ignite plan set-status <IGT-ID> <status>` 修改状态并刷新摘要。

当前发布范围只在 `docs/plans/releases/*.json` 维护。Release 文件不保存状态；`pnpm ignite status --write` 从 Plan 与证据实时推导 `docs/others/ignite-status.md`，不要手改派生表。

## 1. 先确定输入

AI 开始实现前必须读取：

1. 对应的 `docs/features/` 需求规格；
2. `AGENTS.md` 和受影响的 `docs/standards/`；
3. 当前 `docs/designs/` 与实际源码、Schema、测试；
4. 本轮唯一的 `docs/plans/` 文件。

如果需求涉及用户行为、API、Schema、依赖、架构或多个文件，必须新建 Plan。纯错字和无行为变化的格式修正可以不建 Plan。

存量功能修改可用 `pnpm create:change <kebab-name>` 建立 `draft` Plan 和 Release；它只创建待填写的执行契约，不会凭空生成需求或测试。先完成目标、REQ/AC、影响范围与授权，再转 `ready`。新模块仍使用 `pnpm create:module`。结构正确但需求尚未展开的未来 draft 不阻塞当前任务；它自己转 `ready` 时必须补齐实施输入。

## 2. 关闭 Plan 中的开放问题

Plan 进入实现前必须写清：

- 只选择一种变更类型；
- 目标、非目标和影响路径；
- 兼容性、数据迁移与回滚要求；
- 每条验收标准对应的测试层级和命令；
- 需要更新的设计规格；
- 所有开放问题均已关闭，或记录用户明确接受的假设。

若执行中发现检查通过但用户目标仍有未验证的场景，把它记录在 Plan 顶部 `remaining_work`；`ignite next` 会优先提示继续做，`done` 会拒绝非空清单。清空这份清单本身会改变稳定契约，必须在最终提交上重验；不能只勾正文任务就宣布完成。

用户在同一请求中明确要求“直接实现”即视为已授权执行；否则涉及产品取舍、破坏性操作或基础设施替换时应等待确认。

## 3. API 与业务逻辑 Core Loop

1. 根据需求和 Plan 编写或更新测试。
2. 运行目标测试，确认它因缺少目标行为而失败，而不是因为语法、配置或环境错误。
3. 编写满足测试的最小实现。
4. 运行目标测试，修复失败直到通过。
5. 重构重复逻辑，保持测试为绿色。
6. 运行 `pnpm ignite check --plan <IGT-ID> --level auto`；CLI 会根据真实改动选择不可降级的最低检查层级。

如果修复会扩大范围、需要新权限、会破坏数据或与规格冲突，应停止循环并报告，而不是静默绕过。

## 4. UI 与 E2E Loop

涉及页面或交互时，在 Core Loop 之外增加：

1. 在需求中提供原型链接、仓库内原型，或明确写“无外部原型，以当前设计系统为准”。
2. 在 `docs/others/test-cases/` 写出关键用户路径、断言和失败状态。
3. 实现并通过 API/组件层验证。
4. 使用真实浏览器检查布局、交互、loading、error、empty 和成功状态。
5. 将稳定路径固化为 Playwright 测试。
6. 运行 `pnpm test:e2e`；视觉无法由 DOM 断言覆盖时保留截图或人工验证记录。

浏览器探索只用于发现行为，Playwright 脚本才是可重复执行的回归资产。

## 5. 结果回写

- Plan 是过程方案：追加状态记录，不把失败尝试改写成从未发生。
- `docs/designs/` 是当前设计契约：完成后更新最终状态。
- 源码、Schema、Migration 和测试是可执行实现：发现与设计不一致时，本轮必须修正或明确记录未解决差异。
- 影响长期规则时更新 `docs/standards/`；形成架构取舍时追加 ADR。

## 6. 准出条件

任务只有同时满足以下条件才算完成：

- 需求验收标准均有证据；
- 目标测试曾按预期失败，随后通过；不适用时在 Plan 说明原因；
- `pnpm ignite check --plan <IGT-ID> --level integration` 通过；
- Schema/Migration 变化通过 `pnpm test:migrations`；
- 发布候选通过生产构建和 `pnpm test:e2e:production`；
- 相关设计文档和 Plan 状态已更新；
- 最终报告列出实际执行的验证，不声称未执行项通过。

## 7. 运行恢复与阻塞

长命令由 `pnpm ignite check` 记录 `run_id`、Plan、命令、仓库输入指纹、commit、环境指纹、runner 身份、心跳和退出码。运行中状态与完整日志只保存在被忽略的 `.ignite/`；成功后才把脱敏、无绝对路径的摘要写入 `docs/others/evidence/runs/`。`pnpm ignite run status` 会只读地区分运行中、已通过、失败和 `orphaned`。观察超时、暂时无输出或一次轮询失败都不能直接重跑；先读取原 run。

同一 Plan、同一命令和同一输入指纹已有活动 run 时复用它；已有通过记录时默认复用，只有输入改变或明确 `--force` 才重新执行。相同失败连续两次且没有新证据时停止机械重试，记录阻塞而不是修改目标宣布完成。

每个子命令有总时限；本地运行表同时记录当前命令与最后输出时间。安静不等于挂起，先检查 `pnpm ignite run status <run-id> --verbose`；确需停止本机当前运行时调用 `pnpm ignite run cancel <run-id>`，由其拥有者清理自己创建的进程组，不直接按外部 PID 杀进程。超时、失败和孤儿运行应根据错误类型定位原因，不能简单继续 `--force`。损坏的单条本地记录会以 `corrupt` 显示，不会隐藏其他运行。

旧证据按运行 commit 保留为历史记录，允许继续修改代码和重新检查；进入 `done` 的瞬间，所有必需证据必须匹配当前输入。过期证据不能完成 Plan，也不应阻止 Plan 回到 `active`、记录阻塞或启动重测。后续增量不会重跑旧 Plan，但 CI 会要求本次 diff 由本次完成 Plan 的 `write_scope` 覆盖。

并行任务在不同工作区修改；每个实现提交带 `Ignite-Plan: IGT-<ID>` trailer，以便检查器区分任务归属。集成后针对整体快照重验；多个任务修改同一路径时由集成者明确解决冲突。`pnpm ignite next --plan <ID>` 从 Plan 和 run 派生下一步，不维护第二份手写任务状态。

普通保留历史的 merge 可以沿用已有提交证据；squash 或 rebase 改写了提交身份后，在合并提交上执行 `pnpm ignite plan reintegrate <ID>`，再重新运行集成、发布检查和完成状态。旧运行清单留作历史，不能只改 `integrated_commit` 的字符串来宣称新提交已测。

CI 的合并门禁只要求本次变更涉及的独立 Plan 已完成并覆盖本次差异；同一 Release 内未交付的未来任务不阻挡这次合并。宣布整个 Release 已完成仍需范围内全部有效 Plan 与证据齐备。`done` 表示本地受测提交完成，不自动表示已经推送、部署或用户可访问；这些交付结果需另核对并如实报告。

## 8. 运行时边界

`.node-version`、`packageManager` 与 `.ai/runtime.json` 共同定义可复现运行时。默认在 WSL/Linux 执行；若改用 Windows，必须单独安装该平台的 `node_modules`。两个系统不得共享同一依赖目录，`pnpm runtime:check` 会在执行前拒绝跨平台复用。
