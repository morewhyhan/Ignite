'use client'

import { useEffect, useState } from 'react'
import { Check, Sun, Moon } from 'lucide-react'

type ColorScheme =
  | 'macaron-pink'
  | 'macaron-blue'
  | 'macaron-green'
  | 'macaron-purple'
  | 'macaron-yellow'
  | 'macaron-orange'
  | 'macaron-pink-dark'
  | 'macaron-blue-dark'
  | 'macaron-green-dark'
  | 'macaron-purple-dark'
  | 'macaron-yellow-dark'
  | 'macaron-orange-dark'

interface ColorConfig {
  name: string
  color: string
}

const lightSchemes: ColorScheme[] = [
  'macaron-pink',
  'macaron-blue',
  'macaron-green',
  'macaron-purple',
  'macaron-yellow',
  'macaron-orange',
]

const darkSchemes: ColorScheme[] = [
  'macaron-pink-dark',
  'macaron-blue-dark',
  'macaron-green-dark',
  'macaron-purple-dark',
  'macaron-yellow-dark',
  'macaron-orange-dark',
]

const colorConfigs: Record<ColorScheme, ColorConfig> = {
  'macaron-pink': { name: '马卡龙粉', color: 'bg-[#FF8F9E]' },
  'macaron-blue': { name: '马卡龙蓝', color: 'bg-[#7CB9E8]' },
  'macaron-green': { name: '马卡龙绿', color: 'bg-[#7DD87D]' },
  'macaron-purple': { name: '马卡龙紫', color: 'bg-[#C8A8D9]' },
  'macaron-yellow': { name: '马卡龙黄', color: 'bg-[#FFE08A]' },
  'macaron-orange': { name: '马卡龙橙', color: 'bg-[#FFB088]' },
  'macaron-pink-dark': { name: '马卡龙粉暗', color: 'bg-[#FF8F9E]' },
  'macaron-blue-dark': { name: '马卡龙蓝暗', color: 'bg-[#7CB9E8]' },
  'macaron-green-dark': { name: '马卡龙绿暗', color: 'bg-[#7DD87D]' },
  'macaron-purple-dark': { name: '马卡龙紫暗', color: 'bg-[#C8A8D9]' },
  'macaron-yellow-dark': { name: '马卡龙黄暗', color: 'bg-[#FFE08A]' },
  'macaron-orange-dark': { name: '马卡龙橙暗', color: 'bg-[#FFB088]' },
}

function applySchemeClass(scheme: ColorScheme) {
  const root = document.documentElement
  const allSchemes = [...lightSchemes, ...darkSchemes]
  allSchemes.forEach(s => {
    root.classList.remove(`scheme-${s}`)
  })
  root.classList.add(`scheme-${scheme}`)
}

function isDarkScheme(scheme: ColorScheme): scheme is ColorScheme {
  return scheme.endsWith('-dark')
}

export function ColorSchemeSelector() {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('macaron-pink')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('color-scheme') as ColorScheme
    const allSchemes = [...lightSchemes, ...darkSchemes]
    if (stored && allSchemes.includes(stored)) {
      setCurrentScheme(stored)
      setIsDark(isDarkScheme(stored))
      applySchemeClass(stored)
    } else {
      applySchemeClass('macaron-pink')
    }
  }, [])

  function setScheme(scheme: ColorScheme) {
    applySchemeClass(scheme)
    localStorage.setItem('color-scheme', scheme)
    setCurrentScheme(scheme)
    setIsDark(isDarkScheme(scheme))
  }

  function toggleMode() {
    const currentColorIndex = isDark
      ? darkSchemes.indexOf(currentScheme)
      : lightSchemes.indexOf(currentScheme)

    if (isDark) {
      const newScheme = lightSchemes[currentColorIndex] || lightSchemes[0]
      setScheme(newScheme)
    } else {
      const newScheme = darkSchemes[currentColorIndex] || darkSchemes[0]
      setScheme(newScheme)
    }
  }

  const currentSchemes = isDark ? darkSchemes : lightSchemes

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted/50 animate-pulse" />
        <div className="flex items-center gap-1">
          {currentSchemes.map((scheme) => (
            <div key={scheme} className="w-5 h-5 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* 颜色选择器 */}
      <div className="flex items-center gap-1 flex-wrap">
        {currentSchemes.map((scheme) => (
          <button
            key={scheme}
            onClick={() => setScheme(scheme)}
            className="relative w-5 h-5 rounded-md transition-all duration-200 hover:scale-110"
            title={colorConfigs[scheme].name}
          >
            <div className={`w-full h-full rounded-md ${colorConfigs[scheme].color}`} />
            {currentScheme === scheme && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-3 w-3 text-gray-700 drop-shadow-md" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 明暗切换按钮 */}
      <button
        onClick={toggleMode}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-current/5 transition-all duration-200"
        title={isDark ? '切换到浅色模式' : '切换到暗色模式'}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}
