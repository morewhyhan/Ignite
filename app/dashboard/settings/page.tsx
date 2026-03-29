'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Save, User, Bell, Shield, Palette, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthSession, useSignOut } from '@/hooks/use-auth'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const signOut = useSignOut()

  const user = session?.user
  const name = user?.name || ''
  const email = user?.email || ''

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    twoFactor: false,
    theme: 'system'
  })

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: 保存用户偏好设置到数据库
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('设置已保存')
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="space-y-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-primary">
              设置
            </h1>
            <p className="text-xl text-muted-foreground">
              管理你的账户和偏好设置
            </p>
          </div>

          {sessionLoading ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : !user ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">请先登录</p>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">个人信息</h2>
                      <p className="text-sm text-muted-foreground">你的基本资料</p>
                    </div>
                  </div>

                  <div className="space-y-4 pl-13">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        value={name}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted/50"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-muted/50 flex items-center justify-center text-muted-foreground">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">通知设置</h2>
                      <p className="text-sm text-muted-foreground">管理通知偏好</p>
                    </div>
                  </div>

                  <div className="space-y-4 pl-13">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">推送通知</Label>
                        <p className="text-sm text-muted-foreground">接收应用内通知</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">邮件通知</Label>
                        <p className="text-sm text-muted-foreground">接收邮件更新</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">安全设置</h2>
                      <p className="text-sm text-muted-foreground">保护你的账户安全</p>
                    </div>
                  </div>

                  <div className="space-y-4 pl-13">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactor">双因素认证</Label>
                        <p className="text-sm text-muted-foreground">为账户添加额外的安全层</p>
                      </div>
                      <Switch
                        id="twoFactor"
                        checked={settings.twoFactor}
                        onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-400/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <Palette className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">外观设置</h2>
                      <p className="text-sm text-muted-foreground">自定义应用外观</p>
                    </div>
                  </div>

                  <div className="space-y-4 pl-13">
                    <div className="space-y-2">
                      <Label>主题</Label>
                      <div className="flex gap-2">
                        {(['system', 'light', 'dark'] as const).map((theme) => (
                          <Button
                            key={theme}
                            variant={settings.theme === theme ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSettings({ ...settings, theme })}
                          >
                            {theme === 'system' ? '系统' : theme === 'light' ? '浅色' : '深色'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center text-destructive">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">退出登录</h2>
                      <p className="text-sm text-muted-foreground">退出当前账户</p>
                    </div>
                  </div>

                  <div className="pl-13">
                    <Button
                      onClick={() => signOut.mutate()}
                      disabled={signOut.isPending}
                      variant="destructive"
                      className="min-w-[120px]"
                    >
                      {signOut.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          退出中...
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          退出登录
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="min-w-[120px]"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存设置
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
