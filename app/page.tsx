'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColorSchemeSelector } from '@/components/color-scheme-selector'
import { AuthModal } from '@/components/auth-modal'
import { useAuthSession } from '@/hooks/use-auth'

export default function Home() {
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { data: session, isPending } = useAuthSession()
  const isLoggedIn = !!session?.user

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard')
    } else {
      setAuthModalOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    setAuthModalOpen(false)
    router.push('/dashboard')
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl">
          <div className="space-y-16">
            {/* Title */}
            <div>
              <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-4 text-primary">
                HonoNext
              </h1>
              <p className="text-xl text-muted-foreground">
                Modern full-stack framework
              </p>
            </div>

            {/* Stack */}
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-baseline gap-3">
                <span className="w-16">Frontend</span>
                <span>Next.js · React · TypeScript</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-16">Backend</span>
                <span>Hono · Edge Runtime</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-8">
              <button
                onClick={handleGetStarted}
                className="text-lg hover:opacity-80 transition-opacity inline-block border-b border-primary pb-0.5 text-primary"
              >
                开始使用 →
              </button>

              <ColorSchemeSelector />
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}
