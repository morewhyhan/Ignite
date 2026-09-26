# Ignite 功能规格：AI 开发执行可信度

## 背景与目标

模板使用者用自然语言描述目标后，AI 应能沿着规格、计划、测试、实现和验收持续推进；工具应暴露真正未完成的部分，避免把工程门禁通过误报为功能交付。

## 模块边界

- 需求类型：存量工程能力改进
- 影响范围：Ignite CLI、计划/发布证据、模块脚手架、测试规范与前端共享边界
- 不增加平行的手工状态文档；已有 Feature、Plan、Design、Others 分工继续作为文档入口

## 字段清单

| 字段         | 类型     | 必填 | 默认值 | 校验规则                           | UI 展示     | 数据来源       |
| ------------ | -------- | ---- | ------ | ---------------------------------- | ----------- | -------------- |
| 原始目标     | 文本     | 是   | 无     | 可追溯到用户请求                   | CLI/Plan    | Release 范围   |
| REQ/AC 覆盖  | ID 列表  | 是   | 无     | 每个纳入项映射到 Plan 和可执行验收 | CLI/Plan    | Feature + Plan |
| Plan 证据    | 运行记录 | 是   | 无     | 对应本 Plan、本次输入与实际行为层  | CLI/Release | Ignite runner  |
| Release 证据 | 运行记录 | 是   | 无     | 对应同一最终集成快照和发布范围     | CLI/Release | Ignite runner  |

## 业务规则

- R1（REQ-TRUST-001）：工程门禁、Plan 行为验收与 Release 整体验收分别显示；未来草稿不阻塞当前交付。
- R2（REQ-TRUST-002）：每个 Plan 只承担本轮明确的 REQ/AC；Release 必须追踪原始目标，遗漏、延期和排除均明确可见。
- R3（REQ-TRUST-003）：UI 行为在 Plan 验收中运行真实浏览器测试；Release 验收绑定同一集成版本的生产构建与全局浏览器回归。
- R4（REQ-TRUST-004）：测试先行记录指向具体 AC、测试和真实预期失败；占位失败、环境错误和事后补造不能充当证据。
- R5（REQ-TRUST-005）：脚手架在生成前识别已有未提交改动，避免新 Plan 将无关改动纳入范围，并生成可补全的用户路径测试说明。
- R6（REQ-TRUST-006）：模板 Web 入口具备桌面、平板、手机的响应式验收和可复查的视觉结果。
- R7（REQ-TRUST-007）：业务请求和类型保持 Hono Typed RPC 真源；可复用请求/查询逻辑不直接依赖浏览器地址、平台通知或窗口 API。
- R8（REQ-TRUST-008）：数据访问边界及破坏性迁移意图在实施前明确；架构记录只用于真实的取舍。
- R9（REQ-TRUST-009）：命令输出给出工程、Plan、Release 各自状态与下一步；版本、标签、说明和验证证据能够互相追溯。
- R10（REQ-TRUST-010）：执行契约、验收契约和发布覆盖版本各自独立校验；新旧组合按兼容矩阵处理，不能因执行契约版本推断 Release 覆盖版本。
- R11（REQ-TRUST-011）：Plan 的下一步建议必须包含该 Plan 与其 Release 的结构校验；任何会被校验器拒绝的状态转换都不能作为建议。
- R12（REQ-TRUST-012）：Release 派生状态有阻塞时必须给出继续哪个 Plan、修复哪份范围定义或运行哪条 Release 验收的行动提示。
- R13（REQ-TRUST-013）：常用 CLI 默认输出精简、可解析的状态摘要；详细上下文显式请求，不重复输出可从 Feature/Plan 读取的全文数据。
- R14（REQ-TRUST-014）：运行时版本不匹配时说明所需版本、当前版本和修复方法；检查只诊断，不自动切换开发环境。
- R15（REQ-TRUST-015）：TDD 定向红灯只校验当前目标 AC；同一测试文件中的其他 AC 被筛选跳过时，不能被误报为失败。
- R16（REQ-TRUST-016）：同一稳定规格/测试基线可连续记录多条 TDD 红灯；生成的 TDD 证据不得让下一条红灯因工作区变脏而被迫额外提交。

## 权限、错误与缓存

- 不允许因缺少 `userId` 字段就推断数据模型错误；由 Feature 明确用户、角色、组织或共享数据边界。
- 证据仅在输入、范围、策略、运行环境和被测版本匹配时复用；输入变化后显示过期并重新验证。
- 排除用户目标必须有明确授权来源；延期仍然是未完成范围。

## 原型与交互

- CLI 状态输出需说明当前层级、结果、未满足项和下一条可执行命令。
- 桌面与移动 Web 在 1440px、768px、390px 及临界宽度下验证；不出现横向溢出、遮挡或不可操作控件。

## 非目标

- 本轮不新增原生 App、小程序或桌面壳；只建立未来适配可接入的共享业务契约边界。
- 不强制每个 CRUD 引入聚合、领域事件、Service 或 Repository。

## 验收标准

- AC-TRUST-001（REQ-TRUST-001）：Given 仓库有未来 draft Plan 且当前工程检查通过 When AI 查询交付状态 Then 命令分别显示工程门禁、当前 Plan 和 Release 状态，并给出下一步。
- AC-TRUST-002（REQ-TRUST-002）：Given Feature 含多个 REQ/AC 且本轮只交付其中一部分 When Plan/Release 进入 ready 或 verifying Then 每条原始目标、纳入验收、延期或授权排除均有完整可追溯映射。
- AC-TRUST-003（REQ-TRUST-003）：Given 一个带 UI 的 Plan 和多个 Plan 组成的 Release When 运行验收 Then Plan 真实运行对应浏览器路径，Release 另对最终组合执行生产构建与浏览器回归。
- AC-TRUST-004（REQ-TRUST-004）：Given 一条需要行为实现的 AC When Plan 完成 Then 可见同一验收测试先因断言目标行为而失败、随后在验收运行中通过；环境失败与占位失败不满足条件。
- AC-TRUST-005（REQ-TRUST-005）：Given 当前工作区存在无关未提交改动 When 创建新模块或存量改动 Plan Then 脚手架保留用户改动并阻止把它们误当成新 Plan 基线；干净工作区生成完整可编辑草稿和测试路径文档。
- AC-TRUST-006（REQ-TRUST-006）：Given 默认业务页面 When 在桌面、平板和手机视口打开并执行主要交互 Then 页面内容、导航、表单和操作无横向溢出或遮挡，失败时保留截图/Trace。
- AC-TRUST-007（REQ-TRUST-007）：Given 业务 Hook 发起 RPC When 同一查询/请求逻辑被复用 Then Hono 类型与 Hook 边界保持唯一，通知和 Web 地址由适配入口提供。
- AC-TRUST-008（REQ-TRUST-008）：Given 新模块涉及共享/私有数据或删除/变更既有数据 When 进入 ready Then Plan/Feature 明确访问范围、迁移影响和回滚方案，并仅对真实架构取舍要求 ADR。
- AC-TRUST-009（REQ-TRUST-009）：Given Release 中的多个 Plan 分别在不同提交通过 When 尝试标记 Release 完成 Then 必须有该 Release 范围在同一最终集成版本的有效生产证据；普通检查通过不会冒充交付完成。
- AC-TRUST-010（REQ-TRUST-010）：Given 新 Plan 使用 `execution_contract: 1` 与 `verification_contract: 2`，旧 Plan 使用 `verification_contract: 1` 或未声明该字段 When 校验各自 Release Then 新组合接受 `verification_contract: 2`、`coverage_version: 2`，旧组合继续接受旧 coverage v1，执行契约版本不再错误决定 coverage 版本。
- AC-TRUST-011（REQ-TRUST-011）：Given 当前 Plan 或其 Release 存在会让治理校验失败的问题 When AI 查询下一步 Then 返回修复提示和涉及文件，不建议转入校验必然拒绝的状态。
- AC-TRUST-012（REQ-TRUST-012）：Given Release 有未完成 Plan、证据缺口、范围决策或待执行的最终检查 When 查询 Release 状态 Then 返回对应 Plan/文件/验收命令；仅当无待办时 next action 才为空。
- AC-TRUST-013（REQ-TRUST-013）：Given AI 或开发者查询常用 Plan/Release 下一步 When 不指定详细模式 Then 输出包含状态、阻塞、相关路径和下一条命令的精简摘要；指定 `--verbose` 时保留完整上下文。
- AC-TRUST-014（REQ-TRUST-014）：Given 当前 Node 与仓库固定版本不一致 When 执行 runtime preflight Then 错误信息同时包含期望/当前版本、推荐切换命令和重试检查命令，且不修改 shell 或运行时。
- AC-TRUST-015（REQ-TRUST-015）：Given 一个 TDD 红灯运行只选择单条 AC、同文件还有其他映射 AC When Vitest acceptance reporter 收到目标失败与非目标跳过 Then 只判定目标 AC，不把被筛选的其它 AC 误报为本次运行失败。
- AC-TRUST-016（REQ-TRUST-016）：Given 同一 Plan 还有多条 AC 需要记录红灯 When Ignite 已生成本 Plan 的 TDD 证据 Then 这些派生记录视为执行状态而不污染源代码工作区，下一条红灯可在不提交中间证据的情况下继续，且普通未提交代码仍会阻止运行。
