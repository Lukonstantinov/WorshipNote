import { useState, useEffect, useRef, useCallback } from 'react'
import { startAudioCapture, type AudioCapture } from '../lib/audioCapture'
import { detectPitch } from '../lib/yin'
import { frequencyToNote, createFrequencyFilter, isAboveNoiseFloor, type NoteInfo } from '../lib/pitchUtils'

interface UsePitchDetectionOptions {
  /** Whether detection is active */
  enabled: boolean
  /** Mic gain multiplier */
  gain?: number
  /** RMS noise threshold */
  noiseThreshold?: number
  /** Specific audio device ID */
  deviceId?: string
}

interface PitchDetectionResult {
  /** Current detected note info, or null */
  note: NoteInfo | null
  /** Detection confidence (0-1) */
  confidence: number
  /** Whether the mic is currently active */
  isListening: boolean
  /** Error message if mic access failed */
  error: string | null
  /** History of recent notes for timeline */
  history: Array<{ note: NoteInfo; timestamp: number }>
}

export function usePitchDetection(options: UsePitchDetectionOptions): PitchDetectionResult {
  const { enabled, gain = 1.0, noiseThreshold = 0.01, deviceId } = options

  const [note, setNote] = useState<NoteInfo | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ note: NoteInfo; timestamp: number }>>([])

  const captureRef = useRef<AudioCapture | null>(null)
  const rafRef = useRef<number>(0)
  const filterRef = useRef(createFrequencyFilter(0.3))
  const lastNoteRef = useRef<string>('')

  const detect = useCallback(() => {
    const capture = captureRef.current
    if (!capture) return

    const buffer = capture.getTimeDomainData()

    if (!isAboveNoiseFloor(buffer, noiseThreshold)) {
      setNote(null)
      setConfidence(0)
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    const result = detectPitch(buffer, capture.context.sampleRate)

    if (result.frequency > 0 && result.probability > 0.8) {
      const smoothedFreq = filterRef.current.update(result.frequency)
      const noteInfo = frequencyToNote(smoothedFreq)
      setNote(noteInfo)
      setConfidence(result.probability)

      // Add to history if note changed
      const noteKey = `${noteInfo.name}${noteInfo.octave}`
      if (noteKey !== lastNoteRef.current) {
        lastNoteRef.current = noteKey
        setHistory((prev) => {
          const next = [...prev, { note: noteInfo, timestamp: Date.now() }]
          return next.length > 50 ? next.slice(-50) : next
        })
      }
    } else {
      setConfidence(0)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [noiseThreshold])

  useEffect(() => {
    if (!enabled) {
      if (captureRef.current) {
        captureRef.current.stop()
        captureRef.current = null
      }
      cancelAnimationFrame(rafRef.current)
      setIsListening(false)
      setNote(null)
      setConfidence(0)
      setError(null)
      filterRef.current.reset()
      lastNoteRef.current = ''
      return
    }

    let cancelled = false

    async function start() {
      try {
        const capture = await startAudioCapture({
          bufferSize: 2048,
          gain,
          deviceId: deviceId || undefined,
        })

        if (cancelled) {
          capture.stop()
          return
        }

        captureRef.current = capture
        setIsListening(true)
        setError(null)
        rafRef.current = requestAnimationFrame(detect)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Microphone access denied')
          setIsListening(false)
        }
      }
    }

    start()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      if (captureRef.current) {
        captureRef.current.stop()
        captureRef.current = null
      }
      setIsListening(false)
    }
  }, [enabled, gain, deviceId, detect])

  // Update gain on existing capture
  useEffect(() => {
    captureRef.current?.setGain(gain)
  }, [gain])

  return { note, confidence, isListening, error, history }
}
