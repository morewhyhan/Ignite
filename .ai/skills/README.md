# 项目级 Skills

项目携带完整 [pstack 技能目录](../pstack/CATALOG.md)。技能、参考文件、playbook与许可真源在 `.ai/pstack/`；各工具发现目录仅桥接。新项目克隆时一并携带，无需全局安装。

新增项目技能应写明用途、输入输出、权限和验证方式，在项目规则登记；不要复制长期规则。

文档维护的必需方法与条件分支由所属 README 和专业标准规定，技能 description 与发现目录负责引导读取正文，不能代替这些固定职责。克隆携带资产不等于宿主已刷新技能列表；即使不支持自动发现，AI 仍应由 AGENTS 进入所属规则并读取同一正文。

正文写在 `.ai/skills/<name>/SKILL.md`，包含与目录一致的 `name` 和实际适用的 `description`。执行 `node scripts/pstack-sync.mjs --write` 生成 `.agents/skills` 与 `.claude/skills` 两处必要发现桥接并更新目录；不带 `--write` 只检查。正文维护在这里，不能在发现目录另写一份；工具不会覆盖同名的用户自建技能。同步时清理带有本工具生成标记的已删除技能入口和旧 Cursor/OpenCode 副本；用户自建文件保留。
