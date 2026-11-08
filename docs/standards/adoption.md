# 模板采用规范

> 文档状态：定稿

## 第一步：准备环境

```
node -v           # 必须匹配 .node-version
pnpm install
pnpm runtime:check
```

Windows 与 WSL 不共享 `node_modules`；换平台先删掉重装。

## 第二步：换掉模板身份

- `.ai/project.json` 的 `mode` 改为 `adopted`。
- `README.md`、`src/config/` 换成你的产品名。
- `.env` 按 `.env.example` 准备，不提交真实 secret。

## 第三步：决定 Tasks 示例的去留

Tasks 是参考模块，可以保留、改造或删除。删除时同步清掉：

```
src/modules/tasks
src/app/dashboard/tasks
src/server/api/routes/tasks
prisma/schema.prisma 里的 Task 模型与迁移
相关测试
```

## 第四步：写 GOAL

在 `GOAL.md` 里写目标、领域、REQ、AC。写完先跑：

```
pnpm goal:audit
pnpm goal:trace
pnpm docs:check
```

三条都过，才开始写业务代码。

## 第五步：每轮开发

```
读 GOAL → 改代码与测试 → pnpm test → pnpm goal:status --run
```

## 数据与部署

- 默认 SQLite，适合单机；换库改 `prisma/schema.prisma` 与 `.env`。
- 生产必须 HTTPS、强 secret、持久化目录；不要在本地 secret 上部署。
- 升级依赖后跑一遍 `pnpm test` 与 `pnpm test:migrations`。
