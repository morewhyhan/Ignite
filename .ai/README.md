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

从当前仓库运行 `node scripts/ignite.mjs skill read technical-writing` 可直接读取项目技能真源，其他技能替换名称即可；依赖已准备后也可使用 `pnpm ignite skill read`。Node 读取入口无需安装项目依赖。路径错误用同一名字恢复，缺失会明确失败；不能运行时沿所属规则的 canonical 链接读取。读取和恢复规则由 [AI 规则维护](../docs/standards/ai-agents.md#固定维护方法) 负责。

项目扩展的 [review-plan](skills/review-plan/SKILL.md) 与 [review-delivery](skills/review-delivery/SKILL.md) 取自 AGE 审查方法，来源及许可随正文保存；它们不计入下述上游 pstack 技能数量。AI 按 Plan 规则主动安排独立审查，记录仍归原 Plan。入口链接和技能目录不等于已经派发独立角色，也不保证所有宿主自动发现或模型始终遵守。

移植的 [pstack](pstack/CATALOG.md) 包含51个主技能、23个playbook。涉及项目修改或文档维护时，AI 默认按所属文档规则的“固定维护方法”读取必需技能与原则，并按规定顺序处理；无需用户先启用 [poteto-mode](pstack/skills/poteto-mode/SKILL.md)。额外方法只按写明的条件使用，明确小改动压缩分析和输出，保留必要记录及验收。项目文档位置、工具和模型要求直接写在对应方法中。方法不扩张权限、不替换项目验收，也不强制技能跑分。

Codex 通过 `.agents/skills/` 发现技能，Claude Code 通过 `.claude/skills/` 发现技能；Cursor 和 OpenCode 复用这两个已支持的目录，不再生成各自的技能副本。两个目录只保存元数据与正文链接，方法正文仍只维护一份。不支持技能目录的工具通过AGENTS入口读取同一真源。支持程度与会话目录刷新取决于实际宿主，不宣称所有平台已运行验证。来源、MIT许可与逐文件适配清单随仓库保留。

目录兼容性依据：[Cursor 技能目录](https://cursor.com/docs/skills)、[OpenCode 技能目录](https://opencode.ai/docs/skills/)、[Claude Code 项目技能](https://code.claude.com/docs/en/skills)。不使用需要额外安装或 Windows 权限的符号链接。
