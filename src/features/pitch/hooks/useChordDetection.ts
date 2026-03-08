import { useState, useEffect, useRef, useCallback } from 'react'
import { startAudioCapture, type AudioCapture } from '../lib/audioCapture'
import { detectChord } from '../lib/chordDetector'
import { isAboveNoiseFloor } from '../lib/pitchUtils'

interface UseChordDetectionOptions {
  enabled: boolean
  gain?: number
  noiseThreshold?: number
  deviceId?: string
}

interface ChordDetectionResult {
  /** Current detected chord name, or null */
  chord: string | null
  /** Match confidence (0-1) */
  confidence: number
  /** Whether listening */
  isListening: boolean
  /** Error */
  error: string | null
  /** Recent chord history */
  history: Array<{ chord: string; timestamp: number }>
}

export function useChordDetection(options: UseChordDetectionOptions): ChordDetectionResult {
  const { enabled, gain = 1.0, noiseThreshold = 0.01, deviceId } = options

  const [chord, setChord] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ chord: string; timestamp: number }>>([])

  const captureRef = useRef<AudioCapture | null>(null)
  const rafRef = useRef<number>(0)
  const lastChordRef = useRef<string>('')

  const detect = useCallback(() => {
    const capture = captureRef.current
    if (!capture) return

    const timeDomain = capture.getTimeDomainData()

    if (!isAboveNoiseFloor(timeDomain, noiseThreshold)) {
      setChord(null)
      setConfidence(0)
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    const freqData = capture.getFrequencyData()
    const result = detectChord(freqData, capture.context.sampleRate, capture.analyser.fftSize)

    if (result) {
      setChord(result.name)
      setConfidence(result.score)

      if (result.name !== lastChordRef.current) {
        lastChordRef.current = result.name
        setHistory((prev) => {
          const next = [...prev, { chord: result.name, timestamp: Date.now() }]
          return next.length > 30 ? next.slice(-30) : next
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
      setChord(null)
      setConfidence(0)
      setError(null)
      lastChordRef.current = ''
      return
    }

    let cancelled = false

    async function start() {
      try {
        const capture = await startAudioCapture({
          bufferSize: 4096,
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

  useEffect(() => {
    captureRef.current?.setGain(gain)
  }, [gain])

  return { chord, confidence, isListening, error, history }
}
