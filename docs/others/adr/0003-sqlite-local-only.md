# ADR-0003：SQLite 仅作为本地默认数据库

## 状态

已接受。

## 决策

模板使用 SQLite 提供快速本地启动，生产环境必须在发布前选择持久化数据库，并同步
Prisma provider、schema、migration、驱动和部署流程。

## 后果

`DATABASE_URL=file:...` 在生产环境会被 `src/server/env.ts` 拒绝；数据库切换不能只改
环境变量，必须形成可审查的迁移任务。
