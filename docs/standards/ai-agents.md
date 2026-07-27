# AI 工作台与真源标准

## 唯一规则真源

项目级 AI 执行规则统一维护在根目录 [`AGENTS.md`](../../AGENTS.md)。长期稳定的方法和工程约束维护在本目录。`CLAUDE.md`、`.cursor/rules/`、`.opencode/` 和 `.github/copilot-instructions.md` 都是入口桥接，不得复制长期规则。

## 文档真源

- 需求与验收：`docs/features/`
- 实施过程：`docs/plans/`
- 当前事实设计：`docs/designs/`
- 稳定规则：`docs/standards/`
- ADR、测试意图和发布记录：`docs/others/`
- 可执行事实：`src/`、`prisma/`、`tests/`、`package.json`

当前系统事实以 `docs/designs/` 为准；需求、计划、标准和验收资料分别位于 `docs/features/`、`docs/plans/`、`docs/standards/` 和 `docs/others/`。

## 扩展资产

- 项目专属 Skills：`.ai/skills/`
- 项目专属 MCP：`.ai/mcp/`

新增资产必须说明用途、输入输出、权限边界和验证方式。工具专属配置可以放在对应桥接目录，但业务规则只能回写真源。

## 维护规则

修改规范时先改真源，再检查所有桥接是否仍然只做入口。不要在 Claude、Cursor、OpenCode 或 Copilot 文件中形成第二套规则。
