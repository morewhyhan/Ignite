# Claude Code 工作台

Claude Code 的项目级规则入口是仓库根目录的 [`CLAUDE.md`](../CLAUDE.md)。

`CLAUDE.md` 只桥接到 [`AGENTS.md`](../AGENTS.md)，不复制规则。若需要增加 Claude 专属命令或本地资产，放在本目录，并在这里登记来源和用途。

`.claude/skills/` 是 Claude Code 必需的项目技能入口，仅由同步脚本生成元数据和正文链接。技能正文维护在 `.ai/`，不在本目录修改。Cursor 和 OpenCode 也支持读取此目录，无需再复制。
