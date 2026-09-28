# 测试用例：AI 执行工作流入口

## 关联规格

- Feature：[`../../features/execution.md`](../../features/execution.md)
- 执行设计：[`../../designs/execution.md`](../../designs/execution.md)

## 关键路径与自动化

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
| AC-EXECUTION-030 | CI 生产态 E2E 启动不起来时，日志能显示 Next stdout 与 Playwright webServer 诊断 | `tests/contracts/execution-reliability.test.ts` |

测试资产只声明要验证的行为，不记录手工通过状态；结果以 Plan 绑定的运行证据为准。

干净模板与维护记录清理：`AC-EXECUTION-027` 由 `tests/contracts/template-history.test.ts` 验证零记录起点及孤立证据拒绝；`AC-EXECUTION-028` 由 `tests/contracts/ignite-cli.test.ts` 验证 CI 从 Git 核对已清理 Plan，以及拒绝未测或缺证据的改动。
