import { useEffect, useState } from 'react'
import { Sun, Moon, Laptop2 } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    return stored
  }

  return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>('auto')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')

    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  return { mode, toggleMode, mounted }
}

interface ThemeToggleProps {
  variant?: 'header' | 'sidebar'
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ variant = 'header', size = 'md' }: ThemeToggleProps) {
  const { mode, toggleMode, mounted } = useThemeMode()

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={`rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] opacity-50 ${
          size === 'sm' ? 'p-1.5' : 'p-2'
        }`}
      >
        <Sun size={size === 'sm' ? 16 : 18} />
      </button>
    )
  }

  const iconSize = size === 'sm' ? 16 : 18
  const iconProps = { size: iconSize, className: 'transition-transform' }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleMode}
        aria-label={label}
        className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <div className="relative h-4 w-4">
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              mode === 'light' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <Sun size={16} />
          </div>
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              mode === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <Moon size={16} />
          </div>
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              mode === 'auto' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <Laptop2 size={16} />
          </div>
        </div>
        <span className="flex-1 text-left">
          {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto'}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] p-2 text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition-all hover:border-[var(--lagoon)] hover:bg-[var(--lagoon)]/10 hover:shadow-[0_8px_22px_rgba(79,184,178,0.15)] hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
    >
      <div className="relative h-5 w-5">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            mode === 'light' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Sun {...iconProps} />
        </div>

        <div
          className={`absolute inset-0 transition-all duration-300 ${
            mode === 'dark' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Moon {...iconProps} />
        </div>

        <div
          className={`absolute inset-0 transition-all duration-300 ${
            mode === 'auto' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
        >
          <Laptop2 {...iconProps} />
        </div>
      </div>
    </button>
  )
}
