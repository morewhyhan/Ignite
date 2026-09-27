# AI 执行流程加固规格

## 背景与目标

让 AI 从采用模板、起草改动到完成验收都能准确接续工作，防止目标缩减、证据范围误读、状态重复维护、依赖过粗、共享文件冲突、夹具耦合与重复验证。试开发业务保留在模板仓库之外。

## 模块边界

- 范围：执行工具、文档脚手架、测试基础设施。
- 不改变业务 Hook → Hono Typed RPC → Prisma 的分层。

## 业务规则

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

## 验收标准

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

## 验收边界

结构校验只能证明已记录目标的对应关系，原始请求是否遗漏仍需 AI 逐项语义审查。真实数据库、浏览器和外部集成验收不得以 mock 测试代替。模板本身的数据库与桌面/移动浏览器基线由集成、迁移及发布检查验证；采用后的新产品需按实际目标另行验收。
