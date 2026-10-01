# AI 执行工具规格

## 背景与目标

定义模板自带开发工具的可验证行为：采用、脚手架、任务接续、验证、恢复和交付。这里描述持续维护的能力；具体项目的业务需求另建 Feature。

## 模块边界

- 范围：执行工具、文档脚手架、测试基础设施。
- 不改变业务 Hook → Hono Typed RPC → Prisma 的分层。

## 业务规则

- R40（REQ-EXECUTION-040）：删除没有独立职责的 workflow 文档及当前入口、生成器与检查器对它的依赖。跨 Plan 的依赖、共享写入、交接与冲突处理由 Plan 规则维护，组合完成由 Release 规则维护；专业规则仍在各自真源。模板缺少冗余文件时正常诊断与生成，缺少必要的 Plan 规则仍应拒绝诊断通过。保留原有任务状态、协作契约、真实验收和历史证据。

- R39（REQ-EXECUTION-039）：需求、Plan、测试、完成条件、沟通和规范维护各自拥有单一的编写与维护入口；生成的 Feature 和 Plan 直接引用所属规则。具体 Plan 与 Release 协调本轮结果，依赖与交接归 Plan 规则，组合完成归 Release 规则，不另建权限、状态或验收条件。保留原始目标、整体判断和现有真实验收边界。

- R36（REQ-EXECUTION-036）：next 直接提供目标、任务、缺口与下一步，不增加独立的提示词文件或阶段路由字段；删除提示词路由后，精简与详细输出的既有行动、验证和授权边界保持一致。当前规格替换旧能力时，已完成 Release 的覆盖按被测版本解释，未完成发布仍核对当前规格；未知目标和遗漏 AC 继续拒绝。
- R37（REQ-EXECUTION-037）：需求、Plan、测试、验收、沟通与规则维护的执行标准直接归入各自现有文档；实际生成的两种 Plan 草稿保留原始目标核对、整体判断和原生规则及协作入口，新模块 Feature 提供可观察行为与边界的填写位置，不依赖额外提示词。草稿仍未完成，自动化只验证生成与接续行为，内容是否合理及模型是否改善另行评估。

- R31（REQ-EXECUTION-031）：日常接续摘要保留全部目标、约束、非目标和任务状态，AI 先回看 Plan 的整体判断，再选择行动；摘要不自动证明分析完整或优先级正确。
- R32（REQ-EXECUTION-032）：使用 execution_contract 1 的 active Plan 有未完成任务时，优先提示接续任务而不是默认启动检查；验收缺口、输入错误、阻塞和活动运行保持优先处理，快速验证仍可按需执行。
- R33（REQ-EXECUTION-033）：新增模块和存量改动脚手架沿用同一 Plan 模板，生成整体判断与推进顺序的草稿入口；草稿没有通过证据，进入实现前需完成语义审查。

- R27（REQ-EXECUTION-027）：干净模板允许零 Plan、零 Release、零运行证据且无需归档目录；若保留了历史记录，其关联和完整性仍须校验，孤立证据不得被忽略。
- R28（REQ-EXECUTION-028）：模板维护记录从发布快照清理后，CI 可从本次 Git 提交区间恢复已删除的完成 Plan 及同一快照证据，按原校验验证并核对源码一致性；未完成、损坏或不能覆盖当前代码的历史记录不能放行，已采用项目不启用此模板清理规则。
- R29（REQ-EXECUTION-029）：自动化测试创建的临时 Git 仓库必须自行设置提交身份，不依赖运行机器的全局 Git 配置。
- R30（REQ-EXECUTION-030）：CI 生产态 E2E 启动失败时必须保留 Playwright webServer 诊断和应用服务器 stdout，避免只留下无根因的 readiness timeout。

- R1（REQ-EXECUTION-001）：原始目标完整映射，延期不等于排除。
- R2（REQ-EXECUTION-002）：验收区分模拟、真实数据库、浏览器和外部集成。
- R3（REQ-EXECUTION-003）：发布逐计划计算有效证据缺口。
- R4（REQ-EXECUTION-004）：任务状态只维护一份机器源。
- R5（REQ-EXECUTION-005）：稳定契约允许并行开发，最终依赖约束完成。
- R6（REQ-EXECUTION-006）：共享文件明确负责人和交接信息。
- R7（REQ-EXECUTION-007）：迁移夹具可扩展，示例可移除。
- R8（REQ-EXECUTION-008）：跨平台指纹一致，公共检查可复用。
- R9（REQ-EXECUTION-009）：脚手架按生成的界面准备 unit/browser 验收，预览不写文件；采用项目能区分模板基线交付与新项目工作。
- R10（REQ-EXECUTION-010）：下一步指引根据当前输入与证据推进，旧失败不阻塞修复后的输入。
- R11（REQ-EXECUTION-011）：模板采用归档完整覆盖继承的 Plan、Release、运行清单和 TDD 红灯证据；多个有效基线记录也必须一并归档。
- R12（REQ-EXECUTION-012）：AI 脚手架与 Release 证据回写生成的 Plan/Release 文件必须符合仓库格式，常规命令完成后无需人工格式修复。
- R13（REQ-EXECUTION-013）：Release 覆盖检查必须使用 Release 当前列出的全部 Plan；范围遗漏时明确报告缺失 Plan，不得误报为缺少验收映射。
- R14（REQ-EXECUTION-014）：新 Git 历史采用模板时，归档 Plan 等记录后，保留文档中的链接必须仍能指向归档件。
- R15（REQ-EXECUTION-015）：Ignite CLI 提供可直接调用的帮助入口，帮助请求不得误执行其他命令。
- R16（REQ-EXECUTION-016）：AI 初次识别项目状态默认收到精简摘要；完整 JSON 仅在确需机器上下文时读取。
- R17（REQ-EXECUTION-017）：脚手架批量创建文件遇到写入或提交错误时，必须回滚已创建的文件并保留原有 Release 内容。
- R18（REQ-EXECUTION-018）：占位失败检测只检查对应 AC 的活动测试体，不能被同文件内其他测试、注释或字符串样例误触发。
- R19（REQ-EXECUTION-019）：Git 改动路径读取必须保留 Unicode 文件名，写入范围和证据检查不得将合法路径误判为越界。
- R20（REQ-EXECUTION-020）：全仓规格与 Plan 校验在支持的 WSL 环境中不得因过短的默认测试超时产生假失败；不得通过跳过断言或缩小校验范围消除超时。
- R21（REQ-EXECUTION-021）：新 Git 历史的模板副本在基线验证前，必须明确提示先归档不属于当前历史的模板执行记录；完整克隆与浅克隆分别给出正确动作，不得把继承记录误报为项目自身缺陷。
- R22（REQ-EXECUTION-022）：没有 Release 的新项目生成状态摘要时，必须保持仓库 Prettier 格式，不能让模板基线检查因空白格式失败。
- R23（REQ-EXECUTION-023）：模板自身的治理测试不得依赖示例历史 Plan/Release 仍留在当前目录；新历史采用并归档后，基线测试仍须可运行且证据可追溯。
- R24（REQ-EXECUTION-024）：真实 Prisma 迁移升级验收必须为完整验证环境预留经实测的单项运行时间，不得因固定短超时中断，也不得降低迁移断言或全局放宽所有测试。
- R25（REQ-EXECUTION-025）：新历史模板副本必须先按锁文件安装项目依赖，再运行依赖这些包的诊断与历史归档 CLI；采用文档中的命令顺序必须能在干净副本实际执行。
- R26（REQ-EXECUTION-026）：TDD 红灯证据必须绑定对应 AC 的活动测试用例，而不是整份测试文件；同文件新增无关用例不得让既有证据失效，目标用例发生变化则必须重新验证；历史 schema 1 记录继续可验证。

## 验收标准

- AC-EXECUTION-040（REQ-EXECUTION-040）：Given 只有原生专业规则、没有 workflow 文件的干净模板 When 执行实际 template:doctor 并分别生成模块与存量改动 Then 诊断通过，两种 Plan 的跨 Plan 链接直接到 Plan 的实际协作段落，Plan 的组合完成链接直接到 Release 的实际完成段落，无需恢复 workflow 文件；移除 Plan 规则时诊断仍报缺少必要文件。正式文档检查不得要求已删除文件或留下失效链接，既有协作契约和业务回归保持通过。

- AC-EXECUTION-039（REQ-EXECUTION-039）：Given 干净模板中已准备各专业规则 When 实际创建新增模块与存量改动 Then 两种 Plan 的推进、纠偏、完成和沟通链接直接落到对应真源，模块 Feature 直接链接需求编写规则，所有这些目标文件及段落存在；跨 Plan 协作直接引用 Plan 规则，草稿任务与红灯、验收证据保持未完成。

- AC-EXECUTION-036（REQ-EXECUTION-036）：Given Plan 分别处于实现、输入修复、阻塞、验证或终止后的报告入口 When 查询精简及详细 next Then 不含 execution_guidance，目标与约束仍保留，next_action 在两种输出中一致并保持原有缺口和阻塞优先级。
- AC-EXECUTION-038（REQ-EXECUTION-036）：Given 完成的 Release 引用真实被测提交且当前规格已替换旧能力 When 检查覆盖 Then 使用被测规格验证，遗漏当时 AC 或添加未知目标仍失败；未完成 Plan、没有被测提交或缺失 Plan 不能沿用历史规格绕过当前校验。
- AC-EXECUTION-037（REQ-EXECUTION-037）：Given 干净工作区 When 分别创建新增模块和存量改动 Then 两种 Plan 草稿直接含原始目标核对、整体判断与原生 Plan 和测试入口，新模块 Feature 含用户行为与边界填写位置，所有生成文档不引用独立提示词文件；任务、红灯及验收证据仍未完成。

- AC-EXECUTION-031（REQ-EXECUTION-031）：Given Plan 已记录 goals、constraints、non_goals 和 tasks When 不加 verbose 查询 next Then 全部内容保留在精简摘要，详细验收上下文仍只在 verbose 中输出。
- AC-EXECUTION-032（REQ-EXECUTION-032）：Given active Plan 有未完成任务 When 查询 next Then 优先接续进行中的任务，没有进行中任务时展示全部待办供按 Plan 依据选择，不武断选第一个；真实缺口或阻塞优先，任务完成后仍提供正式检查，历史契约入口保持可用。
- AC-EXECUTION-033（REQ-EXECUTION-033）：Given 干净工作区 When 分别创建新增模块与存量改动 Then 两种 draft 都包含同一整体判断入口及执行标准链接，任务仍未完成且没有验收或红灯通过记录。

- AC-EXECUTION-027（REQ-EXECUTION-027）：Given 没有继承过程记录的模板副本，When 校验模板历史完整性，Then 无需创建虚假归档即可通过，出现孤立运行或红灯记录时仍失败。
- AC-EXECUTION-028（REQ-EXECUTION-028）：Given 模板维护 Plan 和证据已提交后从工作目录删除，When CI 检查跨越清理的提交区间，Then 真实通过且源码未变的 Plan 仍能覆盖改动，非终态、缺失证据、后续未测改动及已采用项目删除 Plan 均不能借此通过。
- AC-EXECUTION-029（REQ-EXECUTION-029）：Given 测试在没有全局 Git 用户配置的干净 CI runner 上运行，When 测试夹具创建提交并重写历史，Then 临时仓库使用自身的提交身份并可完成验收。
- AC-EXECUTION-030（REQ-EXECUTION-030）：Given CI 启动生产态 E2E 服务，When 应用服务器未达到健康检查或启动失败，Then 工作流日志保留 Playwright webServer 诊断和应用服务器 stdout；本地运行不额外启用 CI 调试输出。

- AC-EXECUTION-001（REQ-EXECUTION-001）：Given 已登记原始目标，When 延期或排除目标，Then 延期仍计入未完成范围，排除必须有用户授权来源。
- AC-EXECUTION-002（REQ-EXECUTION-002）：Given 带层级的验收映射，When 声称 database/browser 验收，Then 拒绝直接 mock 边界和错误测试类型，运行结果逐层归属。
- AC-EXECUTION-003（REQ-EXECUTION-003）：Given 多项证据绑定，When 输入或检查策略改变，Then 分别报告 missing、stale、invalid，其他 Plan 的同名证据不能补缺。
- AC-EXECUTION-004（REQ-EXECUTION-004）：Given 任务进度变化，When 更新 tasks，Then 正文由同一元数据生成，进度回填不使稳定执行契约失效。
- AC-EXECUTION-005（REQ-EXECUTION-005）：Given 已提交的上游接口快照，When 下游开发，Then 允许引用未完成上游；文件漂移后拒绝继续沿用旧契约。
- AC-EXECUTION-006（REQ-EXECUTION-006）：Given 共享文件声明，When 非负责人修改或并行声明冲突，Then 拒绝检查并要求明确交接。
- AC-EXECUTION-007（REQ-EXECUTION-007）：Given 业务迁移夹具或待删除 Tasks，When 读取夹具及关联清单，Then 覆盖实际字段与集成点，历史 migration 保留。
- AC-EXECUTION-008（REQ-EXECUTION-008）：Given 不同换行、二进制或历史提交，When 计算输入和还原验收命令，Then 保持 Git 对象一致，后续删除模块测试不使历史证据失效。
- AC-EXECUTION-009（REQ-EXECUTION-009）：Given 新模块或存量改动，When 运行脚手架，Then UI 模块生成 unit/browser 草稿且无通过证据，dry-run 不改变文件或 Release；项目采用不会把模板基线记录误认为新项目交付。
- AC-EXECUTION-010（REQ-EXECUTION-010）：Given 当前集成证据或失败记录，When 请求 next，Then 通过后进入发布验收，旧输入失败不阻塞新输入，真实活动运行仍须等待。
- AC-EXECUTION-011（REQ-EXECUTION-011）：Given 重新初始化 Git 的模板副本包含多个已交付 Plan、关联 Release、运行记录和 TDD 证据，When 执行 `pnpm ignite adopt-history --apply`，Then 每份继承记录都进入同一带索引的历史归档且原位置不再残留；保留完整 Git 历史的克隆不做归档。
- AC-EXECUTION-012（REQ-EXECUTION-012）：Given 在干净的模板副本中新建存量改动 Plan 或记录通过的 Release 验收，When 命令写入 Plan/Release 文件，Then 生成文件立即通过仓库 Prettier 检查；Prettier 缺失或运行失败时命令必须返回错误，不能留下被宣称成功的未格式化结果。
- AC-EXECUTION-013（REQ-EXECUTION-013）：Given 一个 Release 包含多个 Plan，When 覆盖检查收到完整集合或不完整集合，Then 完整集合准确验证每条 AC，不完整集合明确报告缺失 Plan；删除任意 AC 归属仍能报出具体缺失项。
- AC-EXECUTION-014（REQ-EXECUTION-014）：Given 新 Git 历史的模板副本中有文档链接到将被归档的 Plan，When 执行 `pnpm ignite adopt-history --apply`，Then 该链接改为指向对应归档文件，目标存在且后续 `pnpm docs:check` 通过。
- AC-EXECUTION-015（REQ-EXECUTION-015）：Given 用户调用 `pnpm ignite --help`、`pnpm ignite help` 或子命令帮助，When CLI 解析帮助请求，Then 返回对应命令用法、退出码为 0，且不运行状态读取或写入等业务命令。
- AC-EXECUTION-016（REQ-EXECUTION-016）：Given AI 首次进入仓库或按工作流接续任务，When 读取项目状态指引，Then 默认命令使用精简状态摘要，不要求输出完整 `status --json`；完整上下文仍可显式请求。
- AC-EXECUTION-017（REQ-EXECUTION-017）：Given 模块或存量改动脚手架在提交文件集合时发生文件系统错误，When 写入流程失败，Then 新建文件全部回滚，已有 Release 字节内容保持不变，命令明确报告失败并可安全重试。
- AC-EXECUTION-018（REQ-EXECUTION-018）：Given 测试文件中含有其他测试的抛错逻辑或用于断言的占位文本，When 验证指定 AC 是否仍为脚手架占位测试，Then 只根据该 AC 对应的活动测试体判断，不误拒绝合法测试，也能识别对应测试体内真实的占位失败。
- AC-EXECUTION-019（REQ-EXECUTION-019）：Given 当前改动含有中文或其他 Unicode 文件名，When Ignite 从 Git 收集 Plan 改动路径并核对 `write_scope`，Then 返回原始文件名并按实际范围正确允许或拒绝，不将 Git 的引用转义文本误认为真实路径。
- AC-EXECUTION-020（REQ-EXECUTION-020）：Given 支持的 WSL 环境和完整模板基线，When 全仓文档追踪与 Plan 结构校验运行，Then 两项完整校验保留全部断言并使用足以覆盖实测运行时间的 90 秒测试上限，不因 30 秒默认值误报超时或跳过检查。
- AC-EXECUTION-021（REQ-EXECUTION-021）：Given 新 Git 历史的模板副本仍包含引用旧提交的继承 Plan，When 运行 `pnpm template:doctor`，Then 它以明确错误阻止后续 `pnpm verify` 并指引先预览、确认归档和提交历史；诊断不自动移动文件。完整历史克隆不阻止，浅克隆指引先取回完整历史。
- AC-EXECUTION-022（REQ-EXECUTION-022）：Given 新项目归档完历史且当前没有 Release，When 运行 `pnpm ignite status --write`，Then `docs/others/ignite-status.md` 仍符合仓库 Prettier 格式，基线 `pnpm verify` 不会被空 Release 区段的多余空行拦截。
- AC-EXECUTION-023（REQ-EXECUTION-023）：Given 模板副本已将继承的 Plan、Release 与运行证据归档且当前目录为空，When 执行模板治理测试，Then 测试使用自己的夹具或校验归档索引，不要求被归档路径、ID 仍可从 `docs/plans/` 读取；新历史副本完整 `pnpm verify` 通过。
- AC-EXECUTION-024（REQ-EXECUTION-024）：Given WSL 中真实 Prisma 升级验收需启动多个隔离迁移子进程，When 完整测试套件运行，Then 该用例具有至少 240 秒的单项预算，且全局默认超时与其它测试预算不被放宽。
- AC-EXECUTION-025（REQ-EXECUTION-025）：Given 新历史副本尚无 `node_modules`，When 采用者按 `docs/standards/adoption.md` 执行首次采用步骤，Then 锁文件依赖安装必须先于 `template:doctor` 与 `adopt-history` 预览/归档，命令顺序可执行且归档仍先于基线验收。
- AC-EXECUTION-026（REQ-EXECUTION-026）：Given 同一个测试文件包含一个已记录 TDD 红灯的 AC 用例和其他用例，When 添加或修改不相关的兄弟用例后验证该 Plan，Then 既有红灯证据仍有效；目标 AC 测试用例本身发生变化时证据失效；新生成的记录按活动测试用例内容计算哈希，历史 schema 1 文件级记录兼容验证。

## 验收边界

结构校验只能证明已记录目标的对应关系，原始请求是否遗漏仍需 AI 逐项语义审查。真实数据库、浏览器和外部集成验收不得以 mock 测试代替。模板本身的数据库与桌面/移动浏览器基线由集成、迁移及发布检查验证；采用后的新产品需按实际目标另行验收。
