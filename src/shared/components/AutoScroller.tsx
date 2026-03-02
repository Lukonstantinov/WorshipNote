import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'

export function AutoScroller() {
  const { t } = useTranslation()
  const { scrollSpeed } = useSettingsStore()
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isScrolling) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const scroll = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current
        window.scrollBy(0, (scrollSpeed * delta) / 200)
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(scroll)
    }

    rafRef.current = requestAnimationFrame(scroll)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [isScrolling, scrollSpeed])

  return (
    <button
      onClick={() => setIsScrolling((p) => !p)}
      className="px-4 py-2 rounded-xl font-semibold text-sm"
      style={{
        backgroundColor: isScrolling ? '#4ade80' : '#2d2d4e',
        color: isScrolling ? '#0f0f0f' : '#f5f5f5',
        minHeight: 44,
        minWidth: 44,
      }}
    >
      {isScrolling ? '⏸ ' + t('pause') : '▶ ' + t('autoScroll')}
    </button>
  )
}
