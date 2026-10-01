import { useEffect, useRef, useState } from 'react'
import { ChevronsDown, Pause } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'

interface Props {
  scrollRef?: React.RefObject<HTMLElement | null>
}

export function AutoScroller({ scrollRef }: Props) {
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
        const amount = (scrollSpeed * delta) / 200
        if (scrollRef?.current) {
          scrollRef.current.scrollBy(0, amount)
        } else {
          window.scrollBy(0, amount)
        }
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(scroll)
    }

    rafRef.current = requestAnimationFrame(scroll)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [isScrolling, scrollSpeed, scrollRef])

  return (
    <button
      onClick={() => setIsScrolling((p) => !p)}
      className="flex items-center justify-center rounded-xl transition-all"
      style={{
        backgroundColor: isScrolling ? 'var(--color-chord)' : 'var(--color-card-raised)',
        color: isScrolling ? 'var(--color-bg)' : 'var(--color-text-secondary)',
        minHeight: 40,
        minWidth: 40,
        flexShrink: 0,
      }}
      title={isScrolling ? t('stopScroll') : t('autoScroll')}
      aria-label={isScrolling ? t('stopScroll') : t('autoScroll')}
      aria-pressed={isScrolling}
    >
      {isScrolling
        ? <Pause size={18} strokeWidth={2} />
        : <ChevronsDown size={18} strokeWidth={1.5} />
      }
    </button>
  )
}
