import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Square } from 'lucide-react'

interface Props {
  bpm: number
}

export function Metronome({ bpm }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeBeat, setActiveBeat] = useState(-1)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const beatCountRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
      setTimeout(() => setActiveBeat(beat), delay)

      nextNoteTimeRef.current += 60.0 / bpmRef.current
      beatCountRef.current++
    }

    timerRef.current = setTimeout(scheduler, interval)
  }, [scheduleClick])

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    beatCountRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    scheduler()
  }, [scheduler])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setActiveBeat(-1)
  }, [])

  const toggle = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) { stop(); return false }
      start(); return true
    })
  }, [start, stop])

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-xl transition-all active:scale-95"
        style={{
          backgroundColor: isPlaying ? '#ff9f0a' : '#2c2c2e',
          color: isPlaying ? '#000' : 'rgba(235,235,245,0.6)',
          minHeight: 44,
          minWidth: 44,
          width: 44,
        }}
        title={isPlaying ? `Stop metronome` : `Metronome (${bpm} BPM)`}
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
                    ? b === 0 ? '#ff9f0a' : '#32d74b'
                    : '#2c2c2e',
              }}
            />
          ))}
        </div>
      )}

      {isPlaying && (
        <span className="text-xs font-semibold" style={{ color: '#ff9f0a' }}>
          {bpm}
        </span>
      )}
    </div>
  )
}
