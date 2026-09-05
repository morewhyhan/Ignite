# 验收证据

`runs/` 保存 `pnpm ignite:check` 的运行记录：命令、Plan、输入指纹、commit、环境指纹、PID、退出码和日志路径。`benchmarks/` 保存固定样例的基线与优化后耗时。

证据只证明它声明的层级。结构检查、Vitest、真实数据库、Playwright 和外部 provider 不能互相替代；缺少适用证据时，Plan 必须保持 `verifying` 或 `blocked`。

生成方式：

```text
pnpm ignite:check -- --plan IGT-000 --level auto
pnpm ignite run status
pnpm ignite:benchmark
```
