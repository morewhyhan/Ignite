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
