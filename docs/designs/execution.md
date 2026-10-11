# AI 执行系统

本文件描述执行器当前如何工作。日常接续与跨任务交接见 [Plan 规则](../plans/README.md)，组合验收见 [Release 规则](../plans/releases/README.md)，首次复制见 [采用规范](../standards/adoption.md)。

## 实现分工

| 实现入口                              | 职责                                   |
| ------------------------------------- | -------------------------------------- |
| `scripts/ignite/cli.mjs`              | 命令入口、帮助与下一步摘要             |
| `state.mjs`、`execution-contract.mjs` | Plan/Release 契约、状态迁移与覆盖校验  |
| `review-contract.mjs`                 | 两次独立审查的对象、身份声明与过期校验 |
| `checks.mjs`                          | 根据真实差异和风险选择检查范围         |
| `runs.mjs`、`check-worker.mjs`        | 运行锁、心跳、恢复、取消与证据写入     |
| `tdd.mjs`、`source-analysis.mjs`      | 真实红灯、活动测试识别与 AC 对应       |
| `governance.mjs`                      | 规格追踪、设计快照、AI 入口和 CI 覆盖  |
| `adoption.mjs`、`scaffold-writer.mjs` | 旧副本历史归档与脚手架原子写入         |

表中简称均位于 `scripts/ignite/`；测试结果采集器位于 `scripts/testing/`。

## 三层完成条件

项目技能由 `pnpm ignite skill read <name>` 从当前仓库的 `.ai/skills/` 或 `.ai/pstack/skills/` 真源读取；错误发现地址可附带 `--path`，命令按名字恢复并说明恢复位置，真源缺失明确失败。实现入口是 `scripts/ignite/skill-reader.mjs`，不安装依赖、不写文件、不从上层项目借用技能。

新模板与脚手架声明 `task_contract: 2`，tasks 用 phase 区分 prepare、red、implement、verify，red 与 implement 关联实际 AC。新契约要求先完成 prepare；原生 prepare 任务完成命令检查准备结果，红灯入口要求对应 red 任务已启动。`state.mjs` 在首个有效红灯前比较当前代码和基线，包括暂存区，拒绝提前实现；已有有效红灯后按 AC 的原生证明控制实施任务。阶段和 AC 映射纳入输入契约，任务状态更新不改变契约。历史契约 1 保留兼容，不自动迁移。CLI 无法阻止宿主任意写文件，实际 Agent 执行仍须观察。

新模块脚手架只生成规格、计划、测试资料和失败测试，不生成业务页面外壳。浏览器草稿通过 `E2E_DATABASE_URL` 访问原生运行器的隔离数据库，不能退回开发数据库；占位测试仍不算准备完成或红灯。Release 允许同一 AC 覆盖多个原始目标，但各引用的处理方式与实际负责 Plan 必须一致，遗漏目标检查保持有效。

- 工程门禁：结构、类型、Lint、格式和适用的迁移检查通过。
- Plan：一项交付的目标、真实测试与当前集成证据完整，才可置为 done。
- Release：全部纳入 Plan 完成后，在同一最终提交运行生产构建和全量生产态 E2E；不借用不同提交的零散绿色结果。

`pnpm delivery:check --plan <ID>` 调用 `validate --delivery`，从完成 Plan 的 `base_commit` 取得本轮范围；也可显式给 `--base <40位commit>`。入口要求真实祖先基线，复用 CI 的完成 Plan 和受测内容覆盖检查，并包含工作区、暂存和未跟踪文件。HEAD、工作区和暂存内容分别与受测文件比较，恢复工作区不能掩盖暂存漂移，未跟踪业务文件不由旧记录覆盖。任意非完成 Plan 或不一致的受测内容都不能覆盖业务修改。

该只读入口不生成运行回执、不修改 Plan，不代替工程、Plan、Release 的真实运行。普通 `check` 和构建不承担交付覆盖含义。CI 仍使用事件提供的 DIFF_BASE 和原有历史模板恢复分支；本地基线不从最近提交或远端分支猜测。宿主任意写入和文本完成报告仍无法由仓库 CLI 拦截。

新 Plan 使用 `execution_contract: 1`、`verification_contract: 2`；新 Release 使用 `coverage_version: 2`、`verification_contract: 2`。历史契约按原版本解释。检查策略版本由 `checks.mjs` 的 `CHECK_POLICY_VERSION` 定义，运行清单固定当时策略，不在文档复制版本号。

Release scope 逐条连接原始目标、来源、REQ、AC 和负责 Plan。延期保持未完成；排除需要明确授权。结构校验只能证明映射完整，AI 仍需核对自然语言目标。数据归属、访问依据、迁移与回退由 Plan 的 `data_contract` 声明。

Release 有真实集成提交且所有纳入 Plan 已完成时，覆盖校验从该被测提交读取 Feature；后续能力替换不把历史记录误报为未知需求。未完成组合仍读当前规格；缺失 Plan、未知目标和当时未覆盖 AC 继续拒绝。快照选取不代替真实发布证据，旧发布输入变化仍显示 stale。

## 测试与证据

AC 通过 `required_layers` 和 `checks` 对应 unit、database、browser、external。模拟测试不能充当真实数据库、浏览器或外部服务验收。Reporter 记录实际执行结果，跳过、遗漏或重试后才通过均不算完成。

Vitest 的普通行为组最多两个 worker 并行，Tasks 所有权故障注入在它结束后单独运行。两组继承同一别名、隔离与测试配置，由根 reporter 汇总当前运行；故障注入断言和子进程时限保持原样，不用单独运行的结果拼成正式通过。

TDD runner 只接受目标行为的断言失败。schema 2 红灯绑定 AC 对应的活动测试用例及哈希；同文件其他用例可变化，目标用例变化需重验。schema 1 先核对历史整文件哈希，再比较对应活动用例。定向红灯只判定当前 AC，集成检查判定本次映射的全部 AC。

未完成 Plan 的红灯一致性检查读取当前工作区用例，实施任务状态更新与检查入口均会拒绝已改变的对应断言。已完成 Plan 则读取其集成提交中的用例，后续修改不会重写历史判定。安全测试环境保留 `E2E_SERVER_MODE`，浏览器启动器支持显式选择生产服务器，环境指纹区分开发与生产模式；未设置模式与显式开发模式等价。

`tdd restart` 只重开未完成 Plan 的选定 AC，保留旧回执和业务代码，记录理由，重置关联的 red、implement、verify 任务并撤销旧验收绑定。重复等待红灯的请求不再次回写。该操作不生成凭证，也不自动回滚实现；AI 按 testing 的修正步骤恢复真实未实现行为，再通过原生 red 和完整验收。已完成历史和未知 AC 拒绝重开。

`.ignite/runs/` 保存本机运行状态和日志；成功后才写出无 secret、PID、绝对路径和原始日志的证据摘要。证据绑定输入、环境、命令、日志哈希与真实 commit。源码、测试、依赖或稳定契约改变即失效；状态与证据回填不使同一输入重复验收。done 记录按当时被测版本追溯。

Release 证据还记录 package version 与当时指向受测提交的 tag；这些身份变化需重验。系统不自动创建标签，done 不表示已推送或部署。

## 接续与失败恢复

执行标准由各专业入口维护：Feature README 定义需求与 AC；Plan README 定义立项、整体判断、接续、纠偏和单项完成；testing 定义检查选择与断言层级，evidence README 定义运行恢复与证据维护；Release README 定义范围与组合完成；AGENTS 定义沟通；ai-agents 定义规则维护；Design README 定义当前事实的维护与一致性核对。

具体 Plan 围绕本轮原始结果连接专业产出，具体 Release 组织组合版本。跨 Plan 的依赖、共享写入、交接和冲突处理归 Plan README，组合完成归 Release README；无需独立 workflow 文档。Feature 草稿提供“用户行为与边界”，Plan 的“整体判断与推进顺序”保存条件比较、重点依据、结果分支和纠偏条件，测试用例保存具体行为、层级及能发现的错误。没有独立提示词文件、并行状态或阶段路由。

两种脚手架生成 Plan 时直接引用 Plan 的推进、纠偏、完成与跨 Plan 交接段落，沟通直达 AGENTS，测试直达 testing。新模块 Feature 直达需求编写规则。`tests/contracts/document-ownership.test.ts` 实际生成草稿并跟随链接核对所属文件与段落，也在无 workflow 的副本运行真实模板诊断，缺少 Plan README 仍拒绝通过；`tests/contracts/native-execution.test.ts` 验证原生输出与生成行为。文档检查与模板诊断要求原生 Plan 规则，不再要求已删除的冗余文件。草稿保持未完成且没有通过证据；语义质量和实际模型效果需按 [评估案例](../others/test-cases/execution-focus.md) 另行判定。

`tasks` 是唯一任务状态；正文进度和总览由 CLI 派生。`next` 先核对 Plan 与 Release，再给允许的下一步；`remaining_work` 非空时不能完成。默认输出精简摘要，完整上下文通过 `--verbose` 或 `status --json` 请求。

`next` 精简摘要保留全部 goals、constraints、non_goals、tasks。启用 planning_contract 1 的 active Plan 只推荐前置任务已完成的任务，优先进行中任务；完整输出用 blocked_by 说明其余任务卡在哪里。没有可启动任务时明确报告依赖阻塞。没有新契约的历史 Plan 保持原接续规则。

新模板和脚手架同时声明 planning_contract 1、review_contract 1。任务除阶段和 AC 外，还保存可观察成果 result、局部写入 scope、前置 depends_on 和负责 owner；任务范围须包含在 Plan 写入范围中，未知依赖、循环、占位负责人和提前启动被拒绝。TDD 重开同时复位依赖已失效的下游任务，保留旧回执而不借用它完成当前任务。

AI 按 Plan 规则主动发起开工和交付的独立审查。`review context` 提供当前对象摘要，`review record` 把真实审查结果写回同一个 Plan 的 reviews。开工对象包含规格、任务契约及计划正文；交付额外包含 Plan 范围内实际差异的文件内容身份。任务进度、审查记录和状态日志不改变对象；目标、规格或交付内容变化使相应审查过期。ready 要求当前开工审查通过，done 另要求当前交付审查通过；通过审查不替代测试。身份可信度是 declared：工具检查所声明的审查者不同于负责人及实施者，不能认证宿主身份或替 AI 真实发起角色。宿主无法提供独立角色时保留缺口，不伪造通过。历史 Plan 不自动迁移或倒填审查。

精简与详细 next 直接给出同一 `next_action`；接续先回看 Plan 原始目标映射及当前判断，再按实际缺口行动。工具不评价模型是否理解正确，不授予产品决定或操作权限。

同一工作区使用运行锁；相同输入的活动或成功运行可复用。进程中断、超时、取消与失败分别记录；worker 在控制进程退出后清理自身后代，不终止其他任务。坏记录单独报告，恢复从原 run 开始。

并行开发通过已提交的 `dependency_contracts` 锁定接口，通过 `shared_files` 明确负责人。最终集成要求依赖 Plan 完成；交接包含接口、迁移、测试入口和剩余工作。

脚手架先预检并暂存整组文件，失败时回滚本轮写入。旧模板的历史归档同时修正保留文档的链接，异常时恢复。Git 路径按原始 Unicode 读取，不修改全局 Git 配置。

自动化测试的临时 Git 仓库在初始化时写入本地 `user.name` 与 `user.email`，确保提交和 rebase 测试不依赖开发者机器或 CI runner 的全局 Git 身份。

CI 生产态 E2E 使用 line reporter 实际输出 Next webServer stdout/stderr，并启用 `pw:webserver` 诊断；服务启动失败的真实子进程测试确认输出未被 reporter 丢弃。本地运行不默认开启调试。构建任务用 tar 保留生产产物的相对依赖链接，接收任务独立安装同一锁文件依赖后解包；跨工作区依赖加载回归与完整生产态 E2E 一起守住这条链路。

## 干净模板与项目历史

发布快照不带模板建设期 Plan、Release、运行清单和审计报告。零记录模板可直接开始；治理测试用隔离夹具验证工作流，不依赖某个旧计划文件。仍适用的 Feature、Design、ADR、测试和空白模板继续保留。

旧版本副本若继承了不属于其 Git 历史的记录，`template:doctor` 指引先安装依赖、建立初始提交，再预览并显式 `adopt-history --apply`。完整克隆不归档；浅克隆补齐历史；混合缺失记录需恢复对应提交。诊断不自动改文件。

模板维护记录提交后可以从工作目录清理。CI 仅在 `template-baseline` 下，从本次提交区间最近删除前的快照恢复完成 Plan 及证据，执行原有校验，再对当前改动逐文件比较受测版本；缺证据和未测修改不会放行。已采用项目保留自己的 Plan/Release，不启用此清理分支。

普通合并保留证据提交；squash/rebase 后使用 `plan reintegrate` 重新验证。远端同步仅在 `next --verify-remote` 核对具体提交后报告，应用部署另行验收。

## 项目内pstack方法库

各文档所属固定维护方法位于规则开头。`pnpm ignite skill read --for <所属规则.md> --list` 返回该规则的固定必需步骤及真源清单，不展开正文。清单来自所属规则和 AI 标准的必需链接，排除条件方法，不维护第二份映射。逐份调用 `skill read <name>` 读取完整正文，每次工具调用只读一份，截断时补读；清单成功不是正文已读证据。原有不带 `--list` 的全文接口保持兼容；任一正文缺失或越出当前项目时失败，不返回部分成功。依赖未准备时直接读取项目正文链接。Feature 固定步骤明确原生 R/REQ 与 AC 格式；Plan 固定步骤要求草稿同时建立引用的 Release scope，并保留空证据。该入口降低漏读步骤的机会，实际模型使用仍须另行观察。

结构化 Plan 的变更类型由元数据校验，文档门禁不再要求正文复制字段；旧非结构化 Plan 保留正文选择检查。正文仍承担兼容性、迁移和回退的解释。

模板携带 `.ai/pstack/` 的51个主技能、23个playbook及配套资源，共152份上游文件，不包含问题报告机器人。方法正文和参考文件在同一真源维护；项目文档位置、实际工具模型及具体步骤直接维护在对应技能与流程中，不另设适配层；项目修改或文档维护默认进入所属README及专业标准的固定维护方法，读取必需技能、原则并按步骤执行，仅在写明条件下使用额外方法；无需用户先启用poteto-mode。[目录](../../.ai/pstack/CATALOG.md)提供逐技能入口。Codex 通过 `.agents/skills/` 发现技能，Claude Code 通过 `.claude/skills/` 发现技能；Cursor 和 OpenCode 复用这两个已支持的目录，不再生成各自的技能副本。两个目录只保存元数据与正文链接，方法正文仍只维护一份。AGENTS及工具规则指向同一目录。上游MIT许可与逐文件来源哈希随项目保留。

该变化是方法与发现入口的文件交付，不证明真实模型收益、所有平台会话已刷新、Plan integration或Release已通过。角色模型读取项目config.json并默认继承当前宿主；委派、持续执行和外部插件使用实际可用能力，不自动购买模型服务。继承playbook作为方法参考，不能覆盖项目原有Feature/Plan/Design/Evidence真源或创建并行任务状态。

上游辅助工具不属于主应用编译范围；根TypeScript、ESLint与Prettier显式排除`.ai/pstack`，保留方法内容与辅助工具独立依赖边界。方法和桥接由资产/文档检查核对，不伪称可选自动化运行通过。

方法使用原生 Plan 决策、tasks、依赖与 handoff；验证技能引用 Feature REQ/AC 和原有测试，不再生成维护中的另一份验收地图。`.ai/skills` 保存新增项目技能，`scripts/pstack-sync.mjs` 统一维护两个必要发现目录、技能索引和来源本地哈希，默认只检查，写入前拒绝同名非生成文件；只清理带生成标记的过期入口和旧平台副本。角色入口读取本地 JSON，未配置则继承宿主；不安装模型引擎。

可选辅助脚本不隐式安装 Bun 依赖；工作区审计默认只读本地 Git 状态，空格路径和未跟踪文件被保留。原生 Plan 不接受上游固定十路/性能栏目检查。PR watch 结束和 READY 不代表原生验收。

Release scope 的纳入项必须关联负责 Plan 的 REQ/AC；延期、授权排除保留真实 Feature REQ/AC 和原因（排除还需授权），不关联伪完成 Plan。原生 scope 校验与全 AC 覆盖校验采用同一处理尺度。

原生 Plan 结构检查和文档门禁按实际模板的完整二级标题核对，代码块、注释与标题前缀不能冒充栏目。状态进入 ready 等执行阶段前必须有关联 Release。`plan validate <ID> --prepare` 只读核对当前 Feature、Plan、Release 的开工结构、完整 scope 和数据契约，输出文档失败项及未来测试待办，保持真实状态，不产生验收证据。next 在草稿缺条件时先指向准备检查，不再建议必然被拒绝的 ready。

方法入口同时返回固定维护节中的编号与未编号必需条款，条件方法有独立边界；技能命令通过只含 Node 标准库的入口执行，未安装依赖的新克隆也可读取。Node 契约在重依赖加载前核对，错误版本先提示修复环境。新模块的 --docs-only 入口使用原模板，仅生成 Feature、Plan、Release，未来业务代码和测试保留待办。

准备检查同时验证每个 Release 目标内部的 REQ/AC 对应，整体齐全不能掩盖单个目标挂错验收。prepared 只说明文档结构，ready 字段决定是否具备正式开工条件，行为和 Release 验收仍另行运行。

Release 范围覆盖由 coverage_version 决定，旧验收契约不能绕过其已声明的 coverage_version 2 对应关系检查。

方法清单的 `tool_options.max_output_tokens` 根据真源 UTF-8 字节数加保守余量生成，正文最低容量为 4096，清单最低容量为 8192。首次按一个所属规则读取清单，再使用每份容量读取正文；这个数字是宿主可容纳上限，不是方法提速 KPI 或实际 token 消耗。宿主及外层工具裁剪不受项目 CLI 控制，发生截断仍须补读；命令成功不能证明模型完整阅读或恰当应用。

原生检查运行保留 UTC 起止时间，用单调时钟计算命令耗时；系统校时或 WSL 回拨不会产生负耗时。旧失败记录保持原样，新运行继续接受完整证据校验。

Vitest 验收报告器从宿主读取已解析的 testNamePattern，用完整测试名称识别手动局部运行。绑定 Plan、CI 或验收结果输出时不缩小案例范围，继续拒绝缺失、跳过、预期失败与重试后通过。

新副本的 Next 根目录由 next.config.mjs 的文件位置决定，不由父目录锁文件猜测。准备检查仅把测试主体中的无条件 throw Error 或 expect.fail 视为占位失败，条件防护交给真实行为运行判断。WSL 拒绝恢复说明由采用规范承载，AGENTS 的必读环境条款直接指向它。
