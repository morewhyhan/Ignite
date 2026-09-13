# 发布范围

这里保存当前发布的机器可读范围。一个发布只列出纳入的 Plan、必须通过的证据和明确排除项，不保存 `status`。状态由 Plan 与证据推导，并通过 `pnpm ignite status --write` 生成摘要。

不要把历史 Plan 批量改成新状态，也不要把 `excluded` 项当作本轮阻塞。发布是否可交付，必须以 `must_pass` 对应的运行证据为准。

机器源格式见 [`_template.json`](./_template.json)。
