# Designs

这里存放当前系统的设计事实（Source of Truth）。与 plans 不同，designs 描述的是
现在系统是什么，而不是某一轮准备做什么；发生最终变更时更新对应设计文档。

## 编写、维护与验收

记录当前模块、接口、数据、运行边界和实际连接，指向源码或结构化规格；不把计划、待实现能力或历史方案写成现状。修改后只更新受影响的当前事实，不复制 Plan 的过程和状态。

按实际 Schema、API、模块与用户路径核对相应说明及结构化快照；事实一致由当前 Plan 引用代码、测试和设计检查证明。尚未解决的差异记录在 Plan，不能仅靠设计文档自评通过。需要长期解释的架构取舍放 ADR，本页保留结果与引用。

## 当前入口

- [数据库设计](./database.md)
- [API 设计](./api.md)
- [领域模型](./domain.md)
- [认证设计](./auth.md)
- [运行时设计](./runtime.md)

结构化规格：

- [`domain.puml`](./domain.puml)：当前领域关系图
- [`database.sql`](./database.sql)：SQLite DDL 快照
- [`api.yaml`](./api.yaml)：业务 API OpenAPI 快照
- [`sequence.puml`](./sequence.puml)：任务查询请求时序图
- [视觉设计系统](./design.md)
- [AI 执行系统](./execution.md)：Plan 契约、验收分层、证据与并行交接

## 固定维护方法

涉及本类文档时，先读取以下必需方法：[how](../../.ai/pstack/skills/how/SKILL.md)、[principle-prove-it-works](../../.ai/pstack/skills/principle-prove-it-works/SKILL.md)。必须按下面的顺序处理，不能由 AI 自行省略；未触及本类文档时不强制执行。

1. 从已实施的代码、配置和验收证据还原当前事实，先辨别计划中的内容与已经存在的行为。
2. 在原有设计位置更新本次受影响的边界、数据流、限制和入口；未来方案留在 Feature/Plan，不写成当前能力。
3. 核对与可执行事实、Feature 和完成证据一致，引用必要依据，不复制任务进度或整份运行日志。

只有长期架构理由需要保存时，读取 [why](../../.ai/pstack/skills/why/SKILL.md) 并按 ADR 规则处理。未验收能力写清限制；写完 Design 本身不能证明功能完成。
