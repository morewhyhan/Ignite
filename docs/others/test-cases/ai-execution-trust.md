# 测试用例：AI 执行可信度

## 关联规格

- Feature：[`../../features/ai-execution-trust.md`](../../features/ai-execution-trust.md)
- Plan：[`../../plans/20260925-ai-execution-trust.md`](../../plans/20260925-ai-execution-trust.md)
- 执行设计：[`../../designs/execution.md`](../../designs/execution.md)
- API 设计：[`../../designs/api.md`](../../designs/api.md)

## 用户路径与自动化

| 验收标准     | 用户可见的结果                                               | 自动化位置                                                                | 当前状态         |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------- |
| AC-TRUST-001 | 明确区分工程门禁、Plan 验收和 Release 验收，并显示下一步     | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-002 | Release 逐条说明目标是否纳入、延期或获授权排除               | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-003 | UI Plan 在集成检查运行映射的浏览器路径，Release 再验最终组合 | `tests/contracts/execution-trust.test.ts`、`tests/e2e/responsive.spec.ts` | 已编写；尚未执行 |
| AC-TRUST-004 | TDD 只记录真实行为断言失败，不接受环境故障                   | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-005 | 脚手架遇到脏工作区先停下，dry-run 不覆盖现有改动             | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-006 | 首页、认证弹窗和任务流程在桌面/平板/手机视口内可操作         | `tests/e2e/responsive.spec.ts`                                            | 已编写；尚未执行 |
| AC-TRUST-007 | 业务 RPC 由共享 Hook 与注入式传输 adapter 调用               | `tests/contracts/api-design.test.ts`                                      | 已编写；尚未执行 |
| AC-TRUST-008 | 数据访问范围、迁移影响、回滚和授权有明确记录                 | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-009 | Release 的最终证据显示被测 commit、版本和精确 tag            | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-010 | 新旧 execution/verification/coverage 版本按矩阵兼容          | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-011 | `next` 对校验必然失败的输入给出修复路径，不建议错误转换      | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-012 | Release 缺口指向具体 Plan、范围文件或最终验收命令            | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-013 | 常用输出精简，`--verbose` 保留完整诊断上下文                 | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-014 | Node 版本不符时返回推荐切换和重试命令，不自动改环境          | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-015 | 定向 TDD 红灯只判定当前 AC，不把其他跳过用例误报为失败       | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |
| AC-TRUST-016 | 连续记录同一 Plan 的红灯证据不要求每条都提交一次             | `tests/contracts/execution-trust.test.ts`                                 | 已编写；尚未执行 |

## 关键边界

- Playwright 使用仓库内测试数据库和 `example.com` 邮箱，不发送真实邮件，也不依赖第三方账号。
- 桌面、平板与手机视口分别检查横向溢出和认证/任务弹窗边界；生产 Release E2E 是另外一层验收。
- 本文件只记录用例入口。真实执行状态以 Ignite run manifest 和 Plan/Release 证据为准；写好测试不等于测试通过。
