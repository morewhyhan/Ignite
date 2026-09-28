# AI 执行系统

本文件描述执行器当前如何工作。日常操作见 [工作流](../standards/workflow.md)，首次复制见 [采用规范](../standards/adoption.md)。

## 实现分工

| 实现入口                              | 职责                                  |
| ------------------------------------- | ------------------------------------- |
| `scripts/ignite/cli.mjs`              | 命令入口、帮助与下一步摘要            |
| `state.mjs`、`execution-contract.mjs` | Plan/Release 契约、状态迁移与覆盖校验 |
| `checks.mjs`                          | 根据真实差异和风险选择检查范围        |
| `runs.mjs`、`check-worker.mjs`        | 运行锁、心跳、恢复、取消与证据写入    |
| `tdd.mjs`、`source-analysis.mjs`      | 真实红灯、活动测试识别与 AC 对应      |
| `governance.mjs`                      | 规格追踪、设计快照、AI 入口和 CI 覆盖 |
| `adoption.mjs`、`scaffold-writer.mjs` | 旧副本历史归档与脚手架原子写入        |

表中简称均位于 `scripts/ignite/`；测试结果采集器位于 `scripts/testing/`。

## 三层完成条件

- 工程门禁：结构、类型、Lint、格式和适用的迁移检查通过。
- Plan：一项交付的目标、真实测试与当前集成证据完整，才可置为 done。
- Release：全部纳入 Plan 完成后，在同一最终提交运行生产构建和全量生产态 E2E；不借用不同提交的零散绿色结果。

新 Plan 使用 `execution_contract: 1`、`verification_contract: 2`；新 Release 使用 `coverage_version: 2`、`verification_contract: 2`。历史契约按原版本解释。检查策略版本由 `checks.mjs` 的 `CHECK_POLICY_VERSION` 定义，运行清单固定当时策略，不在文档复制版本号。

Release scope 逐条连接原始目标、来源、REQ、AC 和负责 Plan。延期保持未完成；排除需要明确授权。结构校验只能证明映射完整，AI 仍需核对自然语言目标。数据归属、访问依据、迁移与回退由 Plan 的 `data_contract` 声明。

## 测试与证据

AC 通过 `required_layers` 和 `checks` 对应 unit、database、browser、external。模拟测试不能充当真实数据库、浏览器或外部服务验收。Reporter 记录实际执行结果，跳过、遗漏或重试后才通过均不算完成。

TDD runner 只接受目标行为的断言失败。schema 2 红灯绑定 AC 对应的活动测试用例及哈希；同文件其他用例可变化，目标用例变化需重验。schema 1 先核对历史整文件哈希，再比较对应活动用例。定向红灯只判定当前 AC，集成检查判定本次映射的全部 AC。

`.ignite/runs/` 保存本机运行状态和日志；成功后才写出无 secret、PID、绝对路径和原始日志的证据摘要。证据绑定输入、环境、命令、日志哈希与真实 commit。源码、测试、依赖或稳定契约改变即失效；状态与证据回填不使同一输入重复验收。done 记录按当时被测版本追溯。

Release 证据还记录 package version 与当时指向受测提交的 tag；这些身份变化需重验。系统不自动创建标签，done 不表示已推送或部署。

## 接续与失败恢复

`tasks` 是唯一任务状态；正文进度和总览由 CLI 派生。`next` 先核对 Plan 与 Release，再给允许的下一步；`remaining_work` 非空时不能完成。默认输出精简摘要，完整上下文通过 `--verbose` 或 `status --json` 请求。

同一工作区使用运行锁；相同输入的活动或成功运行可复用。进程中断、超时、取消与失败分别记录；worker 在控制进程退出后清理自身后代，不终止其他任务。坏记录单独报告，恢复从原 run 开始。

并行开发通过已提交的 `dependency_contracts` 锁定接口，通过 `shared_files` 明确负责人。最终集成要求依赖 Plan 完成；交接包含接口、迁移、测试入口和剩余工作。

脚手架先预检并暂存整组文件，失败时回滚本轮写入。旧模板的历史归档同时修正保留文档的链接，异常时恢复。Git 路径按原始 Unicode 读取，不修改全局 Git 配置。

自动化测试的临时 Git 仓库在初始化时写入本地 `user.name` 与 `user.email`，确保提交和 rebase 测试不依赖开发者机器或 CI runner 的全局 Git 身份。

CI 生产态 E2E 显式输出 Next webServer stdout，并启用 `pw:webserver` 诊断；生产服务器 readiness 超时时能看到实际启动命令和轮询结果，本地运行不默认开启调试。

## 干净模板与项目历史

发布快照不带模板建设期 Plan、Release、运行清单和审计报告。零记录模板可直接开始；治理测试用隔离夹具验证工作流，不依赖某个旧计划文件。仍适用的 Feature、Design、ADR、测试和空白模板继续保留。

旧版本副本若继承了不属于其 Git 历史的记录，`template:doctor` 指引先安装依赖、建立初始提交，再预览并显式 `adopt-history --apply`。完整克隆不归档；浅克隆补齐历史；混合缺失记录需恢复对应提交。诊断不自动改文件。

模板维护记录提交后可以从工作目录清理。CI 仅在 `template-baseline` 下，从本次提交区间最近删除前的快照恢复完成 Plan 及证据，执行原有校验，再对当前改动逐文件比较受测版本；缺证据和未测修改不会放行。已采用项目保留自己的 Plan/Release，不启用此清理分支。

普通合并保留证据提交；squash/rebase 后使用 `plan reintegrate` 重新验证。远端同步仅在 `next --verify-remote` 核对具体提交后报告，应用部署另行验收。
