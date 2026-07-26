# ADR-0001：采用模块化单体边界

## 状态

已接受。

## 背景

Ignite 是个人长期使用的 Next.js 产品模板，需要让页面、业务模块、共享 UI 和服务端
能力有稳定且易被 AI 理解的边界，同时避免为了形式提前引入过多分层。

## 决策

- `src/app/` 只负责 Next.js 路由、layout、Provider 和页面组合。
- `src/modules/` 按业务能力组织客户端代码。
- `src/components/` 只放跨模块 UI。
- `src/server/` 只放 Hono、认证、数据库、环境变量和第三方服务。
- 新业务先按纵向切片贯穿模型、API、Hook、screen 和页面。

## 后果

小功能不需要 service/repository 空层；当服务端业务规则出现复用或复杂事务时，再增加
对应的服务层，并更新 `docs/designs/`。
