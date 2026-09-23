# AI 执行系统

## 当前实现

`scripts/ignite/execution-contract.mjs` 管理新执行契约；`state.mjs` 负责计划、依赖、范围和逐计划证据；`checks.mjs` 选择检查；`runs.mjs` 保存实际运行及验收结果。CLI 是统一入口，业务分层不变。

新 Plan 在 schema 2 / contract_version 2 上启用 `execution_contract: 1`。历史 Plan 和旧策略证据保留原义，不把它们转换成新规则已经通过。检查策略提升为 5，当前验收需要新策略运行。

## 原始目标与发布

Release `coverage_version: 1` 的 `scope` 保存目标、来源、REQ、负责 Plan 和处理方式。`deferred` 一直计入未完成范围；`excluded` 要求具体授权与理由。结构校验能发现未映射项目，不能证明自然语言目标没有遗漏；AI 仍需在开始时对照原始请求。

证据以 `(plan_id, evidence_id)` 为键逐项检查。绑定缺失、输入变化、策略变化和无效记录分别报告，不因其他 Plan 有同名证据而消失。只有全部纳入目标及其 Plan 完成、证据有效，Release 才是 done。

## 验收分层

每条 AC 的 `tests` 保持兼容；`required_layers` 声明需要的层级，`checks` 将每个测试引用标注为 unit / database / browser / external。`verification_requirements` 表示整项交付不可缺少的层级。

- unit：可以模拟依赖，证明局部行为。
- database：隔离真实数据库，不能直接 mock 数据库边界；事务与约束由行为测试断言。
- browser：真实 Playwright 页面/API 流程，不拦截替换业务 API；模板认证/Tasks 测试不能冒充新增功能验收。
- external：指明 provider，真实环境可用后才执行并产出证据。

策略 5 的 Vitest/Playwright reporter 将实际匹配的 AC、测试引用、层级、执行数和结果写入本次运行文件。执行器将这些记录带入脱敏证据，完成检查要求声明的验收确实出现。源码 mock 检测只是静态防错，不能证明任意间接 helper 的语义，应通过测试审查确认真实边界。

## 单一状态与依赖

`tasks` 记录 id/title/status；Plan 正文只写设计和决策，进度块由 CLI 生成。`remaining_work` 记录额外验收缺口，`handoff.remaining` 记录交接未完成项。新契约的任务状态和剩余清单属于执行记录，更新它们不让相同测试输入失效；改变目标、AC、测试映射、任务定义或依赖快照仍使证据失效。

下游 active 可引用上游 active/verifying 的 `dependency_contracts`，包含计划 ID、已提交 commit 和明确文件路径，工作区文件必须与快照相同。进入 verifying/done 时上游必须 done。共享文件负责人在 `shared_files` 声明；多人范围重叠须认可同一负责人，由集成者接管收口。

## 可扩展夹具与效率

迁移可靠性使用独立基线 schema；应用 migration 仍逐版本部署。`tests/fixtures/migrations/values.json` 提供业务约束合法数据，不在模板探针内硬编码业务字段。`ignite example removal-plan tasks` 给出删除示例的关联清单，历史 migration 保留，认证独立回归保留。

工作区指纹由 Git 按 `.gitattributes` 计算文本/二进制对象，避免跨 Windows/WSL 行尾差异及 UTF-8 解码二进制错误。各平台仍须独立安装依赖。

只复用同一仓库输入、命令、环境和策略下已通过且日志可追溯的 lint、migrations；复用记录携带原 run ID 和日志哈希。格式检查会读取不计入代码指纹的 Plan、Release 和状态文件，因此每次重新检查。构建、生成文件、依赖 Plan 的治理与业务测试不走这层公共缓存。历史运行按当时 Git 提交中的测试文件还原命令，后续删除模块不会追溯破坏旧验收。

`create:module` 生成 UI Screen 及 unit/browser 两层红色验收草稿；`create:change` 提供无写入的 `--dry-run`。两者从元数据直接生成任务进度并给出接续命令。`ignite next` 在集成通过后引导进入 verifying，旧输入的失败只作为历史展示，活动运行仍须等待。

## 验证状态

本次基线由 IGT-005 的集成、发布运行清单记录实际验证结果；状态从 Plan 元数据生成。开发中的改动不能借用旧基线的绿色结果，只有当前输入完成验收后才能标记 done。
