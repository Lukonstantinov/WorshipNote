import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export function AutoScroller() {
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
      className="flex items-center justify-center rounded-xl transition-all"
      style={{
        backgroundColor: isScrolling ? '#32d74b' : '#2c2c2e',
        color: isScrolling ? '#000000' : 'rgba(235,235,245,0.6)',
        minHeight: 44,
        minWidth: 44,
        width: 44,
      }}
      title={isScrolling ? 'Пауза' : 'Авто-прокрутка'}
    >
      {isScrolling
        ? <Pause size={18} strokeWidth={2} />
        : <Play size={18} strokeWidth={1.5} />
      }
    </button>
  )
}
