# 发布范围

这里保存当前发布的机器可读范围。一个发布只列出纳入的 Plan、必须通过的门槛和明确排除的历史待办；状态摘要由 `pnpm ignite:status -- --write` 生成。

不要把历史 Plan 批量改成新状态，也不要把 `excluded` 项当作本轮阻塞。发布是否可交付，必须以 `must_pass` 对应的运行证据为准。

机器源格式见 [`_template.json`](./_template.json)。
