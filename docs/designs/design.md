# Ignite 视觉设计系统

本文档固定当前 Ignite UI 的可复用视觉规则，供新增页面和组件参考。颜色、圆角、动画和基础间距的最终实现仍以 `src/app/globals.css` 与 `src/components/ui/` 为准。

## 视觉方向

- 默认主题是柔和的马卡龙粉色，强调轻量、友好和低压的任务管理体验。
- 页面使用浅色背景、白色卡片和低对比度边框。
- 交互反馈使用短时过渡和轻量进入动画，避免影响任务操作速度。
- 深色主题通过同一组 CSS 变量切换，不在业务组件内硬编码颜色。

## 颜色令牌

| 令牌                  | 当前值    | 用途                   |
| --------------------- | --------- | ---------------------- |
| `--scheme-primary`    | `#ff8f9e` | 主按钮、选中态、焦点环 |
| `--scheme-secondary`  | `#ffd4d9` | 次要强调背景           |
| `--scheme-background` | `#fffbfc` | 页面背景               |
| `--scheme-foreground` | `#4a3f40` | 正文和标题             |
| `--scheme-muted`      | `#8b7e7f` | 辅助文字               |
| `--scheme-border`     | `#f8e8eb` | 边框、输入框和分隔线   |
| `--scheme-card`       | `#ffffff` | 卡片和弹层             |
| `--destructive`       | `#ff6b6b` | 删除和危险操作         |

新增 UI 优先使用 Tailwind 语义令牌，不要直接写颜色值。

## 组件约束

- 基础组件统一复用 `src/components/ui/`。
- 业务组件放在对应的 `src/modules/<module>/components/`。
- 表单、弹窗、表格、提示和加载状态优先使用现有 UI 组件。
- 页面必须处理 `loading`、`error`、`empty` 和正常数据状态。
- 交互状态优先使用 CSS 变量和现有动画令牌，不在单个页面创建重复主题。

## 响应式与布局

- 使用 Tailwind 响应式断点。
- `.container` 的水平内边距为 `2rem`，最大宽度随断点从 `640px` 到 `1400px` 变化。
- Dashboard 页面由 `src/components/layout/dashboard-layout.tsx` 统一提供布局。

## 变更规则

修改视觉基线时，同时更新本文档、`src/app/globals.css` 和受影响的 UI 组件，并通过 Playwright E2E 或浏览器手动验证关键交互。
