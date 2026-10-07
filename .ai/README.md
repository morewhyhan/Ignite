# AI 工作台登记

Ignite 采用“一份真源，多端桥接”的方式：

- 规则真源：[`AGENTS.md`](../AGENTS.md)
- 当前事实：[`docs/designs/`](../docs/designs/)
- Claude Code：[`CLAUDE.md`](../CLAUDE.md) 与 [`.claude/`](../.claude/)
- Cursor：`.cursor/rules/ignite.mdc`
- OpenCode：`.opencode/`
- GitHub Copilot：`.github/copilot-instructions.md`
- 项目技能扩展位：[`.ai/skills/`](./skills/)
- 项目 MCP 扩展位：[`.ai/mcp/`](./mcp/)
- 规范化运行时：[`.ai/runtime.json`](./runtime.json)
- 需求编写：[`features/README.md`](../docs/features/README.md)
- 计划、接续、协作与单项完成：[`plans/README.md`](../docs/plans/README.md)
- 检查选择：[`testing.md`](../docs/standards/testing.md)
- 运行恢复与证据：[`evidence/README.md`](../docs/others/evidence/README.md)
- 组合交付：[`releases/README.md`](../docs/plans/releases/README.md)
- 沟通：[`AGENTS.md`](../AGENTS.md#沟通)
- 规则维护：[`ai-agents.md`](../docs/standards/ai-agents.md)

Feature、Plan 和测试文档分别保存需求、推进依据与验收意图，具体 Plan/Release 组织交付。实际生成与接续行为由 `tests/contracts/native-execution.test.ts` 验证，专业规则直达所属段落由 `tests/contracts/document-ownership.test.ts` 验证；模型执行效果按 [行为评估案例](../docs/others/test-cases/execution-focus.md) 另行评估。

桥接文件只负责把工具引向 `AGENTS.md` 和 `docs/`，不在各个平台复制一套规则。以后修改开发规范时，只改 `AGENTS.md` 及对应的规范文档。

## 工程方法入口

完整移植的 [pstack](pstack/CATALOG.md) 包含51个主技能、23个playbook和3个可选自动化技能。先读 [Ignite适配](pstack/ADAPTER.md)；一般复杂工程任务从 [poteto-mode](pstack/skills/poteto-mode/SKILL.md)按需选择，明确小改动直接执行。方法不扩张权限、不替换项目验收，也不强制技能跑分。

Codex、Claude Code、Cursor、OpenCode分别通过项目内技能桥接发现；不支持技能目录的工具通过AGENTS入口读取同一真源。支持程度与会话目录刷新取决于实际宿主，不宣称所有平台已运行验证。来源、MIT许可与逐文件适配清单随仓库保留。
