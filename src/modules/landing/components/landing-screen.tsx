'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  Boxes,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { AuthModal, useAuthSession } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'

const benefits = [
  {
    icon: Zap,
    title: '更快开始',
    description: '运行底座和常用工程链路已经准备好，把时间留给真正要解决的问题。',
  },
  {
    icon: Layers3,
    title: 'AI 有章可循',
    description: '规则、需求和本轮任务各有位置，AI 能按当前工作接续，不必每次从头猜。',
  },
  {
    icon: ClipboardCheck,
    title: '完成有依据',
    description: '验收与测试对应到具体需求，做完能知道是否达到目标，也方便继续修改。',
  },
] as const

const documentAreas = [
  {
    path: 'docs/standards/',
    title: '长期规则',
    description: 'AI 应该怎样开发，项目必须遵守哪些工程边界。',
    icon: ShieldCheck,
  },
  {
    path: 'docs/features/',
    title: '产品目标',
    description: '要解决什么问题，用户行为怎样才算完成。',
    icon: BookOpenText,
  },
  {
    path: 'docs/plans/',
    title: '本轮任务',
    description: '这次改什么、分几步做、还有什么未完成。',
    icon: Layers3,
  },
  {
    path: 'docs/designs/',
    title: '当前事实',
    description: '系统现在的架构、接口和数据边界是什么。',
    icon: Boxes,
  },
  {
    path: 'docs/others/',
    title: '验证与决策',
    description: '测试路径、重要取舍和可回查的验收证据。',
    icon: FileCheck2,
  },
] as const

export function LandingScreen() {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { data: session, isPending: sessionLoading } = useAuthSession()
  const isLoggedIn = Boolean(session?.user)

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      setAuthModalOpen(true)
    }
  }

  return (
    <>
      <main className="min-h-screen">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md text-foreground"
            aria-label={`${siteConfig.name} 首页`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>
          <ColorSchemeSelector />
        </header>

        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              面向 AI 协作的全栈开发模板
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.045em] text-foreground sm:text-6xl md:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-xl text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-9">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleGetStarted}
                disabled={sessionLoading}
                aria-busy={sessionLoading}
                size="lg"
              >
                开始使用
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <a
                href="#why-ignite"
                className="inline-flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                了解它能做什么
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Layers3 aria-hidden="true" className="h-4 w-4 text-primary" />
                规格驱动
              </span>
              <span className="inline-flex items-center gap-2">
                <Boxes aria-hidden="true" className="h-4 w-4 text-primary" />
                模块化全栈
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
                可验证交付
              </span>
            </div>
          </div>

          <section
            id="foundation"
            aria-labelledby="foundation-title"
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_14px_40px_-28px_rgba(23,34,53,0.35)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Project foundation
                </p>
                <h2 id="foundation-title" className="mt-2 text-lg font-semibold tracking-tight">
                  从界面到数据，边界清楚
                </h2>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Boxes aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>
            <div className="divide-y divide-border">
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">Web</span>
                <span className="text-sm font-medium">Next.js · React · TypeScript</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">业务请求</span>
                <span className="text-sm font-medium">Module Hook → Hono Typed RPC</span>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">数据</span>
                <span className="text-sm font-medium">Hono route → Prisma</span>
              </div>
              <div className="grid gap-1 pt-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span className="text-sm font-medium text-muted-foreground">开发循环</span>
                <span className="text-sm font-medium">Feature → Plan → Test → Verify</span>
              </div>
            </div>
            <p className="mt-5 rounded-lg bg-muted/50 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
              页面和数据层可逐步替换，模板基线不会替代具体项目的验收。
            </p>
          </section>
        </section>

        <section
          id="why-ignite"
          aria-labelledby="why-ignite-title"
          className="border-y border-border bg-card/60"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Why Ignite
              </p>
              <h2
                id="why-ignite-title"
                className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                真正省下的，是从想法到持续修改的距离
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                项目很快能跑起来，难的是每次改动之后还能看懂、验证并继续。Ignite
                预先整理好工程底座和 AI
                可遵循的工作路径，让你更快进入真实问题，也更有把握地把产品做下去。
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="documents-title"
          className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Project docs
            </p>
            <h2
              id="documents-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              文档不是堆在一起，而是各自回答一个问题
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              人来确定目标，AI
              按当前任务读取需要的上下文；完成后再把验证结果和系统现状写回对应位置。
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documentAreas.map(({ path, title, description, icon: Icon }) => (
              <article key={path} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      <code>{path}</code>
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
            <p className="text-sm font-semibold">一轮开发怎样走完</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              问题 → Feature 规格 → Plan → 测试 → AI 实现 → Verify → Design 回写，再开始下一轮增量。
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">先从你想解决的问题开始。</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                把目标说清楚，剩下的工作交给一套有边界、能验收的开发流程。
              </p>
            </div>
            <Button
              type="button"
              onClick={handleGetStarted}
              disabled={sessionLoading}
              aria-busy={sessionLoading}
              size="lg"
              className="shrink-0"
            >
              立即开始体验
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
