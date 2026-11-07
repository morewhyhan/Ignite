# Standards

这里存放长期稳定、要求 AI 和开发者遵守的工程专业标准。Feature、Plan、Release、Design、验收用例与证据的编写、维护和验收规则各归所属目录 README；沟通归根 AGENTS，具体 Plan/Release 负责交付协调。

- [架构标准](./architecture.md)
- [API 标准](./api.md)
- [数据库标准](./database.md)
- [开发标准](./development.md)
- [安全标准](./security.md)
- [测试标准](./testing.md)
- [模板采用规范](./adoption.md)
- [AI 工作台与真源](./ai-agents.md)
- [从规格到实现的 DDD 架构闭环](./specification-to-implementation-ddd.md)：模板级目标基线；已登记为需求来源，绑定规则由后续计划补充

标准描述“应该如何做”，不记录某一轮任务的临时方案，也不复制源码事实。

## 编号约定

标准条目使用 `STD-<领域>-<三位序号>`，设计事实使用 `DES-<领域>-<三位序号>`，架构决策使用 `ADR-<四位序号>`。编号在全仓唯一，由 `scripts/ignite/spec-id-registry.mjs` 扫描，`scripts/check-docs.mjs` 拒绝缺号、重号与计划中的未知引用。
