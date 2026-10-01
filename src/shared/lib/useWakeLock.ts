import { useEffect } from 'react'

/**
 * Keep the screen awake while `active` (e.g. while a song is open on stage).
 * Uses the Screen Wake Lock API (iOS 16.4+, Android Chrome); silently does
 * nothing where unsupported. The lock is dropped by the browser when the app
 * goes to the background, so it is re-acquired when the page is visible again.
 */
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || lock) return
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) { l.release().catch(() => {}); return }
        lock = l
        lock.addEventListener('release', () => { lock = null })
      } catch {
        // denied (e.g. low battery mode) — nothing to do
      }
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      lock?.release().catch(() => {})
      lock = null
    }
  }, [active])
}
