# AI 执行系统

## 契约与状态

`scripts/ignite/` 是 Plan、Release、检查和证据状态的执行实现。旧 Plan 继续按原执行契约解释；新 Plan 使用 `verification_contract: 2`，新 Release 使用 `coverage_version: 2` 与 `verification_contract: 2`。策略升级不会把历史绿色结果改写成新策略证据。

Plan 负责一项可独立验收的交付，必需证据是当前输入下的 `check-integration`。Release 负责多个 Plan 合入后的最终快照，单独要求 `check-release`。Release 状态由所有纳入 Plan、原始目标映射、Plan 证据、最终版本证据共同推导；未来 `draft` 不阻塞当前 Release，`deferred` 会阻止 Release 完成，`excluded` 必须有具体用户授权。

## 三层结果

`pnpm ignite check --plan <ID> --level auto` 的成功只表示本轮检查通过，并不会自动把 Plan 或 Release 置为完成。runner 的结果分为三部分，并由 `verification` 输出：

1. **工程门禁**：结构、类型、lint、格式、迁移和生产构建等工程质量检查。
2. **Plan 行为验收**：当前 Plan 映射的真实测试；页面交互的 Playwright 路径也在 Plan integration 中执行。
3. **Release 最终验收**：所有纳入 Plan 完成后，在一个干净的最终提交上运行生产构建和全量生产态 E2E。

新 Release 使用 `pnpm ignite release verify <release-id> --plan <done-plan-id>`。Release manifest 与派生状态记录同一被测 commit、package version，以及当时指向该 commit 的 Git tag 名称（若存在）；系统不创建 tag，也不把本地通过解释成已推送或已部署。包版本或 tag 名称集合变化会使 Release 证据失效。

## 原始目标与验收覆盖

Release scope 保存用户原始目标、来源、REQ、AC、负责 Plan 与处理方式。每个 Feature 的验收标准必须且只能被映射一次：纳入本 Release、延期或经授权排除。进入 ready 后不接受占位 Feature、空用户目标或无可执行测试的 AC。结构校验可以证明 ID 映射完整，不能证明自然语言目标无遗漏；AI 仍需逐条回看原始请求。

Plan 的 `data_contract` 记录业务数据归属、访问依据、迁移影响与回退方式。只有破坏性数据变更需要具体授权；简单 CRUD 不强制建立 ADR，只有真实架构取舍才写入 ADR。

## 验收层与 TDD

每条 AC 的 `tests` 保持可读路径；`required_layers` 声明验收层，`checks` 将具体用例标为 unit / database / browser / external。Plan integration 执行自己映射的所有层级，Release 则在最终组合上运行生产构建和全量浏览器回归。真实数据库和外部服务仍需各自的隔离边界，mock 不能冒充这些层级。

新 Plan 的 TDD 红灯由 `pnpm ignite tdd red --plan <ID> --ac <AC-ID>` 运行。Plan、Feature 和行为测试必须先提交；runner 只接受可识别的行为断言失败，不接受模块缺失、浏览器启动失败、脚手架 `throw` 或 `expect.fail`。记录保存在 `docs/others/evidence/tdd/<plan-id>/`，保存 AC、测试路径、红灯 commit 和测试内容哈希。准出时检查同一测试内容仍在红灯 commit 与最终受测版本中；每条 AC 缺红灯证明时 Plan 不能 done。

测试/浏览器 reporter 记录实际匹配的 AC、层级、执行数和结果。源码 mock 检查只是静态防错，不证明任意间接 helper 的语义；关键用户结果仍需审阅具体断言。

## 状态、依赖与可回查性

`tasks` 是子任务状态的唯一真源；正文进度块由 CLI 生成。`remaining_work` 保存未关闭的验收缺口；不能只清空字段就完成。上游 active/verifying 契约可由下游通过已提交 `dependency_contracts` 锁定；进入 verifying/done 前依赖 Plan 必须 done。共享 Schema、API 注册和导航由 `shared_files` 明确负责人。

每次运行保留命令、真实 commit、输入/环境指纹和脱敏结果；工程通过、Plan 验收通过、Release 完成分别显示，不跨层借用证据。状态输出提供下一条命令，具体的当前事实以 Plan/Release 元数据和 runner manifest 为准。

`pnpm ignite next --plan <ID>` 在建议状态转换前同时检查 Plan、依赖和其关联 Release 契约；Release 不匹配时返回 `repair-input` 和涉及文件，而不会建议进入 `ready`。`pnpm ignite release status` 为每个 Release 给出当前阻塞项及下一步；默认摘要可读，`--verbose` 返回完整上下文。多 Plan 状态推导在一次 CLI 调用中复用文件、运行证据和工作树指纹快照，避免重复扫描；快照不跨命令缓存。

首次查看仓库状态使用精简的 `pnpm ignite status`；完整 `--json` 仅用于需要机器解析所有 Plan/Release 契约的场景。`pnpm ignite --help` 与 `pnpm ignite <command> --help` 只显示用法，不执行对应命令。模板历史归档会同步改写仍存文档中指向归档记录的本地链接，并在归档过程异常时恢复链接与原记录。模块与存量改动脚手架先暂存整个文件集合，再提交到目标路径；遇到提交错误会回滚本轮新增/替换文件。占位失败检测只检查与 AC 对应的活动测试体，不扫描整份测试文件，避免普通代码样例误拦合法验收。

Ignite 读取 Git 路径清单时对单条 Git 命令设置 `core.quotepath=false`，让 Unicode 文件名以原文参与 Plan `write_scope` 与证据路径比对；这只影响该次 Git 调用，不修改用户全局配置。

TDD runner 将当前 AC 作为显式过滤条件传给 acceptance reporter。Vitest/Playwright 在聚焦红灯时被筛掉的其他 AC 不参与本次判定；正常集成和 CI 仍检查本次运行映射到的全部 AC。

迁移可靠性仍使用隔离 SQLite 和独立历史基线；Tasks 删除方案可由 `ignite example removal-plan tasks` 盘点。历史 migration 保留，模板的示例数据/任务不得被误认为衍生项目数据。
