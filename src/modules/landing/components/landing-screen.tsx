'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Boxes, Layers3, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { AuthModal, useAuthSession } from '@/modules/auth'
import { ColorSchemeSelector } from '@/modules/theme'
import { DocumentSystemMap } from './document-system-map'
import { LandingValueStory } from './landing-value-story'

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
                把一个问题，做成能用、能验证、还能继续改的产品
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                适合有具体问题、想尽快开始验证的个人开发者和小团队。Ignite 把可运行的全栈起点和 AI
                协作规则准备好：你说明目标与取舍，AI
                负责实现并验证；你更早拿到可体验的版本，也能有依据地继续修改。
              </p>
            </div>

            <LandingValueStory />
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
              让 AI 看得懂项目，也让每次修改都有据可循
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              文档各有职责：标准约束整个过程，需求说明要交付什么，计划记录这一轮怎么做，验收后再把系统当前事实写回设计文档。
            </p>
          </div>

          <DocumentSystemMap />
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

        <section
          aria-labelledby="ignite-manifesto-title"
          className="border-t border-border bg-foreground text-background"
        >
          <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-16 sm:px-8 sm:pt-24 sm:pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-lg">
              <h2
                id="ignite-manifesto-title"
                className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.08]"
              >
                <span className="block">好想法死在脑子里，</span>
                <span className="block text-background/70">是最可惜的。</span>
              </h2>
            </div>

            <div className="max-w-2xl space-y-6 pt-1 text-lg leading-9 text-background/75">
              <p>
                想法不是拿来收藏的。
                <br />
                <strong className="font-semibold text-background">是拿来点燃的。</strong>
              </p>

              <p>
                但火种不是烟花。烟花只争一瞬。
                <br />
                <strong className="font-semibold text-background">火种，是要燎原的。</strong>
              </p>

              <p>
                <strong className="font-semibold text-background">燎原之前，先入炉。</strong>
                <br />
                烈火一遍遍烧过。直到炉门再开——
                <br />
                <strong className="font-semibold text-background">
                  那一点火种，已有了可以被举起的形状。
                </strong>
                <br />
                它叫火炬。
              </p>

              <p>
                于是一句“我想做”，也终于变成——
                <br />
                <strong className="font-semibold text-background">“我做成了。”</strong>
              </p>

              <p>
                把它举起来。
                <br />
                <span className="flex flex-nowrap gap-x-2 whitespace-nowrap text-base sm:gap-x-3 sm:text-lg">
                  <span>让人看见、</span>
                  <span>让人借光、</span>
                  <span>让人取暖。</span>
                </span>
                <br />
                <span className="flex flex-nowrap gap-x-2 whitespace-nowrap font-semibold text-base text-background sm:gap-x-3 sm:text-lg">
                  <span>从一双手，</span>
                  <span>到另一双手。</span>
                </span>
              </p>

              <div className="border-t border-background/20 pt-6">
                <div className="flex flex-nowrap items-baseline gap-x-3 whitespace-nowrap">
                  <p className="text-xl font-semibold tracking-tight text-background sm:text-2xl">
                    Ignite your idea.
                  </p>
                  <p className="text-xs font-normal tracking-normal text-background/65 sm:text-sm">
                    点燃你的想法。
                  </p>
                </div>
                <p className="mt-4 whitespace-nowrap text-xl font-semibold leading-tight tracking-tight text-background sm:text-3xl">
                  从一念火种，到万家灯火。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
