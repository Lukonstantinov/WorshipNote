import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createPlaybackAudioContext } from '../../../shared/lib/audio'

interface Props {
  bpm: number
}

export function Metronome({ bpm }: Props) {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeBeat, setActiveBeat] = useState(-1)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const beatCountRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const beatTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const bpmRef = useRef(bpm)

  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])

  const scheduleClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioCtxRef.current!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = isAccent ? 1400 : 880
    gain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)
    osc.start(time)
    osc.stop(time + 0.04)
  }, [])

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current!
    const lookahead = 0.1 // seconds ahead to schedule
    const interval = 25  // ms between scheduler ticks

    while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
      const beat = beatCountRef.current % 4
      scheduleClick(nextNoteTimeRef.current, beat === 0)

      // UI update scheduled slightly before note fires
      const noteTime = nextNoteTimeRef.current
      const now = ctx.currentTime
      const delay = Math.max(0, (noteTime - now) * 1000)
      const beatTimer = setTimeout(() => {
        beatTimersRef.current.delete(beatTimer)
        setActiveBeat(beat)
      }, delay)
      beatTimersRef.current.add(beatTimer)

      nextNoteTimeRef.current += 60.0 / bpmRef.current
      beatCountRef.current++
    }

    timerRef.current = setTimeout(scheduler, interval)
  }, [scheduleClick])

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createPlaybackAudioContext()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    if (timerRef.current) clearTimeout(timerRef.current)
    beatCountRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    scheduler()
  }, [scheduler])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    beatTimersRef.current.forEach(clearTimeout)
    beatTimersRef.current.clear()
    setActiveBeat(-1)
  }, [])

  // Side effects must not live inside a state updater (StrictMode runs updaters twice)
  const toggle = () => {
    if (isPlaying) stop()
    else start()
    setIsPlaying(!isPlaying)
  }

  // Cleanup on unmount
  useEffect(() => () => {
    stop()
    audioCtxRef.current?.close()
    audioCtxRef.current = null
  }, [stop])

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-xl transition-all active:scale-95"
        style={{
          backgroundColor: isPlaying ? 'var(--color-warning)' : 'var(--color-card-raised)',
          color: isPlaying ? '#000' : 'var(--color-text-secondary)',
          minHeight: 40,
          minWidth: 40,
        }}
        title={`${t('metronome')} (${bpm} BPM)`}
        aria-label={`${t('metronome')} (${bpm} BPM)`}
        aria-pressed={isPlaying}
      >
        {isPlaying
          ? <Square size={16} strokeWidth={2.5} fill="currentColor" />
          : <Play size={18} strokeWidth={1.5} fill="currentColor" />
        }
      </button>

      {/* Beat indicator dots */}
      {isPlaying && (
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((b) => (
            <div
              key={b}
              className="rounded-full transition-all duration-75"
              style={{
                width: b === 0 ? 8 : 6,
                height: b === 0 ? 8 : 6,
                backgroundColor:
                  activeBeat === b
                    ? b === 0 ? 'var(--color-warning)' : 'var(--color-chord)'
                    : 'var(--color-card-raised)',
              }}
            />
          ))}
        </div>
      )}

      {isPlaying && (
        <span className="text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>
          {bpm}
        </span>
      )}
    </div>
  )
}
