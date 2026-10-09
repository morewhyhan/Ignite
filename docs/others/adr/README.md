# ADR

每个架构决策新建一个编号文件，例如 `0001-use-modular-monolith.md`。已接受的
决策追加，不删除历史；当前实现事实同步到 `docs/designs/`。

## 固定维护方法

涉及本类文档时，先读取以下必需方法：[why](../../../.ai/pstack/skills/why/SKILL.md)、[architect](../../../.ai/pstack/skills/architect/SKILL.md)、[principle-foundational-thinking](../../../.ai/pstack/skills/principle-foundational-thinking/SKILL.md)。必须按下面的顺序处理，不能由 AI 自行省略；未触及本类文档时不强制执行。

1. 先确认是否存在需要长期保留的架构取舍；普通 CRUD、格式修复和短期执行安排留在 Plan，不强制新增 ADR。
2. 从真实约束和已有边界解释选择，列出实际考虑的方案、依据、代价、未知与推翻决定的条件；不机械扫描所有历史来源或凑足章节。
3. ADR 保存长期理由，Design 保存已实现事实，Plan 保存本次实施和证据；核对三者一致，不把尚未实施的决定写成当前事实。

有重大争议且独立审查能提供新证据时才使用 [interrogate](../../../.ai/pstack/skills/interrogate/SKILL.md)。无法取得历史依据时明确未知，不编造原作者意图。
