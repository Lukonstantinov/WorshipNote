import { useEffect, useRef } from 'react'

interface Options {
  audioCtx: AudioContext | null
  playing: boolean
  bpm: number
  beatsPerBar?: number
}

/**
 * Audible metronome using Web Audio API. Schedules clicks ahead of time
 * for accurate timing — beat 1 of each bar is accented at a higher pitch.
 *
 * The caller is responsible for creating/resuming the AudioContext on a
 * user gesture (mobile Safari requirement) and passing it in.
 */
export function useMetronome({ audioCtx, playing, bpm, beatsPerBar = 4 }: Options) {
  const nextNoteTimeRef = useRef(0)
  const beatCountRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bpmRef = useRef(bpm)

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  useEffect(() => {
    if (!playing || !audioCtx) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume()

    beatCountRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05

    const scheduleClick = (time: number, isAccent: boolean) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = isAccent ? 1400 : 880
      gain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)
      osc.start(time)
      osc.stop(time + 0.05)
    }

    const scheduler = () => {
      const lookahead = 0.1
      const interval = 25
      while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
        const beat = beatCountRef.current % beatsPerBar
        scheduleClick(nextNoteTimeRef.current, beat === 0)
        nextNoteTimeRef.current += 60.0 / bpmRef.current
        beatCountRef.current++
      }
      timerRef.current = setTimeout(scheduler, interval)
    }

    scheduler()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [audioCtx, playing, beatsPerBar])
}
