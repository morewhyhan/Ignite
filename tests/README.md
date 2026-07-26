# 测试目录

测试按“验证边界”划分，不按技术栈重复拆分：

```text
tests/
├── contracts/   # 配置、schema、API 输入输出等稳定契约
├── api/         # Hono route + 数据库的服务端行为
└── e2e/         # 浏览器真实用户流程（Playwright）
```

## 选择哪一层

- 规则或数据结构不能被破坏：放 `contracts/`。
- 单个 API 的鉴权、校验、CRUD 行为：放 `api/`。
- 注册、登录、登出、页面跳转和跨模块流程：放 `e2e/`。

测试文件不放在 `src/` 内，避免把运行时代码和验证代码混在一起。`playwright-report/`、`test-results/`、`.next/` 和 `node_modules/` 都是生成物，不是项目结构。

## 常用命令

```bash
pnpm test          # Vitest：contracts + api
pnpm test:e2e      # Playwright：浏览器流程
pnpm check         # 文档、类型、Lint、格式和 Vitest
```
