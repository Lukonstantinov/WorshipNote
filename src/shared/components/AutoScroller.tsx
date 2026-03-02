import { useEffect, useRef, useState } from 'react'
import { ChevronsDown, Pause } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

interface Props {
  scrollRef?: React.RefObject<HTMLElement | null>
}

export function AutoScroller({ scrollRef }: Props) {
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
        backgroundColor: isScrolling ? '#32d74b' : '#2c2c2e',
        color: isScrolling ? '#000000' : 'rgba(235,235,245,0.6)',
        minHeight: 44,
        minWidth: 44,
        width: 44,
      }}
      title={isScrolling ? 'Stop scroll' : 'Auto-scroll'}
    >
      {isScrolling
        ? <Pause size={18} strokeWidth={2} />
        : <ChevronsDown size={18} strokeWidth={1.5} />
      }
    </button>
  )
}
