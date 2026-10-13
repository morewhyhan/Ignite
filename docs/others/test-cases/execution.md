# 测试用例：AI 执行工作流入口

## 关联规格

- Feature：[`../../features/execution.md`](../../features/execution.md)
- 执行设计：[`../../designs/execution.md`](../../designs/execution.md)

## 关键路径与自动化

整体判断、任务接续和草稿入口的 `AC-EXECUTION-031`、`AC-EXECUTION-032`、`AC-EXECUTION-033` 由 `tests/contracts/execution-focus.test.ts` 验证；实际模型行为另按 [整体判断评估案例](./execution-focus.md) 审查，工具绿灯不证明推理效果。

| 验收标准         | 用户可见的结果                                                                  | 自动化位置                                      |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- |
| AC-EXECUTION-014 | 新历史采用模板后，归档的 Plan 链接仍可打开，文档检查通过                        | `tests/contracts/template-runtime.test.ts`      |
| AC-EXECUTION-015 | CLI 根命令和子命令帮助不执行其他操作，且成功退出                                | `tests/contracts/ignite-cli.test.ts`            |
| AC-EXECUTION-016 | AI 首次查看项目时使用简短状态，不把完整机器数据塞入上下文                       | `tests/contracts/template-runtime.test.ts`      |
| AC-EXECUTION-017 | 脚手架写入失败时不留下半套模块、Plan 或 Release                                 | `tests/contracts/execution-reliability.test.ts` |
| AC-EXECUTION-018 | 占位代码的文本样例不误报，目标 AC 中的真实占位失败仍被拦截                      | `tests/contracts/source-analysis.test.ts`       |
| AC-EXECUTION-019 | Unicode 文件名按原始路径参与 Plan 写入范围核对                                  | `tests/contracts/execution-reliability.test.ts` |
| AC-EXECUTION-020 | 全仓治理测试使用明确的 90 秒上限且保持完整断言                                  | `tests/contracts/execution-reliability.test.ts` |
| AC-EXECUTION-021 | 新历史副本在基线校验前收到归档提示；下载副本、空 Git、完整/浅克隆都有明确下一步 | `tests/contracts/template-runtime.test.ts`      |
| AC-EXECUTION-022 | 没有 Release 的新项目生成格式正确的状态摘要                                     | `tests/contracts/ignite-cli.test.ts`            |
| AC-EXECUTION-023 | 模板归档后治理测试使用夹具并验证历史索引                                        | `tests/contracts/template-history.test.ts`      |
| AC-EXECUTION-024 | 真实 Prisma 升级验收有隔离的充分运行预算                                        | `tests/contracts/execution-timeouts.test.ts`    |
| AC-EXECUTION-025 | 新历史副本先安装依赖，再运行诊断和归档 CLI                                      | `tests/contracts/workflow-entry.test.ts`        |
| AC-EXECUTION-026 | TDD 红灯只绑定目标 AC 用例；兄弟用例可增改，目标用例变化会失效                  | `tests/contracts/source-analysis.test.ts`       |
| AC-EXECUTION-029 | 临时 Git 仓库自带提交身份，无需依赖 runner 的全局 Git 配置                      | `tests/contracts/execution-reliability.test.ts` |
| AC-EXECUTION-030 | CI 启动失败时实际保留服务 stdout、stderr 和 webServer 诊断，不只检查配置字样    | `tests/contracts/ci-build-artifact.test.ts`     |
| AC-EXECUTION-041 | 按实际工作流跨工作区传递构建后，仍可加载链接包及其相邻生成依赖                  | `tests/contracts/ci-build-artifact.test.ts`     |

测试资产只声明要验证的行为，不记录手工通过状态；结果以 Plan 绑定的运行证据为准。

## 执行恢复与任务交接

以下案例维护 `REQ-EXECUTION-042` 至 `REQ-EXECUTION-047` 的验收意图。代码断言和真实浏览器行为分别证明工具结果；模型是否主动派发、正确读技能及交付可用业务，仍按实际开发观察判定。

| 验收标准         | 需要证明的结果与失败边界                                                                           | 自动化位置与层级                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AC-EXECUTION-042 | 输出持续保留，超时/取消清理自有后代，无关进程存活；无 JSON 时保留真实诊断且不产红灯                | `managed-command.test.ts`、`tdd-diagnostics.test.ts`，unit                                                  |
| AC-EXECUTION-043 | E2E 缓存与正常开发隔离，拒绝并发拥有者，恢复自有类型引用；准备失败能定位，首次注册真实进入工作台   | `e2e-startup.test.ts`，unit；`tests/e2e/auth.spec.ts` 的 `authenticates without the Tasks example`，browser |
| AC-EXECUTION-044 | 准备恢复不回退活跃目录，保持当前测试；导入拒绝变更用例和错误历史，成功时保留红灯祖先关系及当前实现 | `tdd-recovery-worktree.test.ts`，unit                                                                       |
| AC-EXECUTION-045 | 任务交接给出准确目录、运行时、负责人、范围、接口和未满足依赖；未知任务拒绝，不启动 Agent           | `agent-handoff.test.ts`，unit                                                                               |
| AC-EXECUTION-046 | 追加状态记录保持开工审查指纹、任务与目标不变；破坏元数据的输入及已完成历史拒绝                     | `plan-notes.test.ts`，unit                                                                                  |
| AC-EXECUTION-047 | 相关 AC 反馈选择映射用例且不发布验收证明或改变 Plan；正式门禁保持完整                              | `targeted-feedback.test.ts`，unit                                                                           |
| AC-EXECUTION-048 | 同一工作与历史输入身份一致；Plan 语义改变使旧集成失效，笔记保持复用；旧策略历史指纹可重现          | `review-continuity.test.ts`，unit                                                                           |
| AC-EXECUTION-049 | 独立任务不被进行中任务隐藏；接口和范围明确时提示并行候选，共用 AC 不误判冲突                       | `execution-continuity.test.ts`、`preparation-frontier.test.ts`，unit                                        |
| AC-EXECUTION-050 | 独立工作包拒绝未完成的上游 Plan，并保留依赖契约                                                    | `handoff-dependencies.test.ts`，unit                                                                        |
| AC-EXECUTION-051 | 真实 JS 字段契约检查能拒绝 Git status 与需求 path 误读；新 integration 带执行脚本门禁              | `tool-type-contract.test.ts`，unit                                                                          |
| AC-EXECUTION-052 | 局部回写不被不相关发布损坏拖累；全局状态刷新仍报告该损坏                                           | `scoped-mutation.test.ts`，unit                                                                             |
| AC-EXECUTION-053 | 开工准备实际检查对应 Feature 的必要标题及本地链接                                                  | `preparation-frontier.test.ts`，unit                                                                        |
| AC-EXECUTION-054 | 已完成代码任务释放写入范围；未完成任务与旧式 Plan 仍保留冲突检查                                   | `scoped-mutation.test.ts`，unit                                                                             |

表中未带目录的文件均位于 `tests/contracts/`。恢复导入用例中的合成凭证仅用于临时 Git 夹具验证校验行为，不能作为项目红灯证据。具体运行结果仍由原 Plan 的原生凭证记录。

`execution-proof.test.ts` 为 042–053 提供基线可执行的目标行为断言；准备失败与标记目标失败分开。044 的初始化、辅助函数、目标失败归属及摘要完整性另由 `source-analysis.test.ts`、`tdd-integrity.test.ts` 验证。首次红灯恢复可显式还原整个 Plan 的实施基线，已有证明后仍限于该 AC；两个实施切片的回归确认活跃实现保留。

`execution-continuity.test.ts` 补充 AC-EXECUTION-044 的有效红灯保留与目标断言变更重开；AC-EXECUTION-048 的真实 Git 工作目录/提交身份一致及变更失效；AC-EXECUTION-049 的独立任务可见和交接责任。均为 unit 行为检查，合成红灯仅用于隔离夹具，不替代项目原生证明。

干净模板与维护记录清理：`AC-EXECUTION-027` 由 `tests/contracts/template-history.test.ts` 验证零记录起点及孤立证据拒绝；`AC-EXECUTION-028` 由 `tests/contracts/ignite-cli.test.ts` 验证 CI 从 Git 核对已清理 Plan，以及拒绝未测或缺证据的改动。
