# 测试用例：模板与 AI 执行

## 关联规格

- Feature：[`../../features/product.md`](../../features/product.md)
- Runtime Design：[`../../designs/runtime.md`](../../designs/runtime.md)
- Workflow：[`../../standards/workflow.md`](../../standards/workflow.md)

## 可执行契约

| 验收标准       | 主要失败条件                                        | 自动化位置                                                        |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| AC-PRODUCT-001 | 全新模板缺少可诊断、安装或迁移入口                  | `tests/contracts/template-runtime.test.ts`                        |
| AC-PRODUCT-002 | 已采用项目继续共享模板身份                          | `tests/contracts/template-runtime.test.ts`                        |
| AC-PRODUCT-003 | 新模块未生成 Feature、Plan、Test、Release           | `tests/contracts/template-runtime.test.ts`                        |
| AC-PRODUCT-004 | 删除参考模块后认证守卫失去覆盖                      | `tests/e2e/auth.spec.ts`                                          |
| AC-PRODUCT-005 | 空、伪造、过期证据可把 Plan 设为 done               | `tests/contracts/ignite-cli.test.ts`                              |
| AC-PRODUCT-006 | AI 省略文件或把检查等级调低                         | `tests/contracts/ignite-checks.test.ts`                           |
| AC-PRODUCT-007 | 同一输入重复运行或失联状态被误判                    | `tests/contracts/ignite-runs.test.ts`                             |
| AC-PRODUCT-008 | Release 手工状态与 Plan/证据冲突                    | `tests/contracts/ignite-cli.test.ts`                              |
| AC-PRODUCT-009 | Windows/WSL 共享依赖或校验污染工作区                | `tests/contracts/template-runtime.test.ts`                        |
| AC-PRODUCT-010 | REQ、AC、测试或 Design 映射断开                     | `tests/contracts/docs-traceability.test.ts`、`api-design.test.ts` |
| AC-PRODUCT-016 | 示例界面层级不清、窄屏溢出或主题切换不可访问/不持久 | `tests/e2e/visual-baseline.spec.ts`                               |

新版 Plan 在 integration 中验收自身映射的行为；所有纳入 Plan 完成后，由 `pnpm ignite release verify <release-id> --plan <done-plan-id>` 验证最终组合版本。旧 `verification_contract: 1` Plan 仍使用 `pnpm ignite check --plan <IGT-ID> --level release`。
