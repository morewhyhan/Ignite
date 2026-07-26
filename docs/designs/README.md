# Designs

这里存放当前系统的设计事实（Source of Truth）。与 plans 不同，designs 描述的是
现在系统是什么，而不是某一轮准备做什么；发生最终变更时更新对应设计文档。

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
