import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Close a popover when the user taps outside it (and its trigger) or presses Escape. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref]
      if (refs.every((r) => !r.current?.contains(e.target as Node))) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, onClose])
}
