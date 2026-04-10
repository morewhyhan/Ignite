export default function DashHomePage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="space-y-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-primary">
              欢迎回来
            </h1>
            <p className="text-xl text-muted-foreground">
              这是你的仪表盘概览
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-muted/50 rounded-xl">
              <p className="text-3xl font-semibold mb-2">3</p>
              <p className="text-sm text-muted-foreground">API 路由</p>
            </div>
            <div className="p-6 bg-muted/50 rounded-xl">
              <p className="text-3xl font-semibold mb-2">2</p>
              <p className="text-sm text-muted-foreground">页面</p>
            </div>
            <div className="p-6 bg-muted/50 rounded-xl">
              <p className="text-3xl font-semibold mb-2">6</p>
              <p className="text-sm text-muted-foreground">配色方案</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">快速入口</h2>
            <div className="space-y-2">
              <a href="/dashboard/tasks" className="block p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span>任务管理</span>
                  <span className="text-muted-foreground">→</span>
                </div>
              </a>
              <a href="/dashboard/settings" className="block p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <span>系统设置</span>
                  <span className="text-muted-foreground">→</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
