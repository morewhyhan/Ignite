const outcomes = [
  {
    number: '01',
    title: '不用从空白工程起步',
    description: '拿到可运行的全栈底座，把时间用在要解决的问题上。',
  },
  {
    number: '02',
    title: '更早拿到可验证的版本',
    description: '围绕一个明确目标交付功能，能体验，也能判断是否做对。',
  },
  {
    number: '03',
    title: '首版之后仍然接得下去',
    description: '每轮留下验证结果和系统现状，下一次修改有据可循。',
  },
] as const

export function LandingValueStory() {
  return (
    <div className="mt-10 grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[0.88fr_1.12fr]">
      <div className="flex flex-col justify-between gap-8 bg-foreground p-6 text-background sm:p-9 lg:p-10">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-background/60">
          <span className="h-px w-7 bg-primary" />
          你可能正处在这里
        </div>
        <div>
          <h3 className="max-w-lg text-2xl font-semibold leading-9 tracking-tight sm:text-3xl sm:leading-[1.35]">
            有一个想解决的问题，想尽快做出自己的产品。
          </h3>
          <p className="mt-5 max-w-lg text-sm leading-7 text-background/70 sm:text-base">
            你不想先花时间拼工程底座，也不想让 AI
            做出第一版后，下一次修改就无从下手。你希望自己把握方向，让 AI 多承担实现。
          </p>
        </div>
        <p className="border-l-2 border-primary pl-4 text-sm font-medium leading-6 text-background/90 sm:text-base">
          个人项目 · 独立产品 · 小团队验证
        </p>
      </div>

      <div className="p-6 sm:p-9 lg:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            用 Ignite 之后，你得到
          </p>
          <h3 className="mt-3 text-xl font-semibold leading-8 tracking-tight sm:text-2xl">
            一个可以开始、可以验证，也可以继续演进的产品起点。
          </h3>
        </div>

        <ol className="mt-7 divide-y divide-border border-y border-border">
          {outcomes.map((outcome) => (
            <li key={outcome.number} className="grid gap-2 py-4 sm:grid-cols-[2.5rem_1fr] sm:gap-3">
              <span className="pt-0.5 text-xs font-semibold tabular-nums text-primary">
                {outcome.number}
              </span>
              <div>
                <h4 className="text-sm font-semibold tracking-tight sm:text-base">
                  {outcome.title}
                </h4>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {outcome.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-5 text-xs leading-5 text-muted-foreground sm:text-sm">
          你说明目标和取舍，AI
          按项目约定执行并验证；结果不是“生成完了”，而是你能亲自体验、判断并继续修改的版本。
        </p>
      </div>
    </div>
  )
}
