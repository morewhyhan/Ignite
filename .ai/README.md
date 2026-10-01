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
- 六项执行提示词：[`docs/standards/execution-focus.md`](../docs/standards/execution-focus.md)，由 AGENTS、草稿与 next 按阶段引用。

提示词用于理解任务、选择行动、执行纠偏、验收、沟通与规则维护。权限仍以用户授权及 AGENTS 为准，引用不授予额外写入、产品决定或对外操作权限。入口验证见 `tests/contracts/execution-prompts.test.ts`，模型实际表现按 [行为评估案例](../docs/others/test-cases/execution-focus.md) 由人复核；引用测试不证明判断正确。

桥接文件只负责把工具引向 `AGENTS.md` 和 `docs/`，不在各个平台复制一套规则。以后修改开发规范时，只改 `AGENTS.md` 及对应的规范文档。
