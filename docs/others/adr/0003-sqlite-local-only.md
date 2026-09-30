# ADR-0003：SQLite 默认用于本地，单机展示部署可显式选择

## 状态

已接受。

## 决策

模板使用 SQLite 提供快速本地启动，生产环境默认必须选择并验证持久化数据库。
仅低流量单机展示部署可通过 `ALLOW_PRODUCTION_SQLITE=true` 显式选择 SQLite，且必须把
`DATABASE_URL` 设为版本目录外的持久化绝对文件路径并由部署者负责备份。该 opt-in 不构成
多实例、高可用或通用生产数据库承诺。

## 后果

未显式 opt-in 时，`DATABASE_URL=file:...` 在生产环境会被 `src/server/env.ts` 拒绝；
非 SQLite provider 的切换不能只改环境变量，必须形成可审查的迁移任务。
