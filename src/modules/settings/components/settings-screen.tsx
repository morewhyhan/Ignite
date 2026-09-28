'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession, useSignOut } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'
import { LogOut, Palette, User } from 'lucide-react'

export function SettingsScreen() {
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const signOut = useSignOut()
  const user = session?.user

  return (
    <div className="min-h-[calc(100vh-4rem)] px-5 py-9 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-8">
          <div className="border-b border-border pb-6">
            <p className="mb-2 text-sm font-medium text-primary">偏好与账户</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">设置</h1>
            <p className="mt-3 text-base text-muted-foreground">管理当前账户并调整应用外观。</p>
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
              <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">账户信息</h2>
                    <p className="text-sm text-muted-foreground">当前登录账户的基本资料</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" value={user.name || ''} disabled className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted/30"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Palette aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">配色方案</h2>
                    <p className="text-sm text-muted-foreground">选择配色并在明暗模式之间切换</p>
                  </div>
                </div>
                <ColorSchemeSelector />
              </section>

              <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <LogOut aria-hidden="true" className="h-4 w-4" />
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
                  <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
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
