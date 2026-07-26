'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthSession, useSignOut } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'
import { LogOut, Palette, User } from 'lucide-react'

export function SettingsScreen() {
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const signOut = useSignOut()
  const user = session?.user

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="space-y-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-primary">
              设置
            </h1>
            <p className="text-xl text-muted-foreground">查看账户信息并调整应用外观</p>
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
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">账户信息</h2>
                    <p className="text-sm text-muted-foreground">当前登录账户的基本资料</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" value={user.name || ''} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </section>

              <Separator />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-400/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">配色方案</h2>
                    <p className="text-sm text-muted-foreground">选择配色并在明暗模式之间切换</p>
                  </div>
                </div>
                <ColorSchemeSelector />
              </section>

              <Separator />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center text-destructive">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">退出登录</h2>
                    <p className="text-sm text-muted-foreground">结束当前账户的登录会话</p>
                  </div>
                </div>

                <Button
                  onClick={() => signOut.mutate()}
                  disabled={signOut.isPending}
                  variant="destructive"
                  className="min-w-[120px]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {signOut.isPending ? '退出中...' : '退出登录'}
                </Button>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
