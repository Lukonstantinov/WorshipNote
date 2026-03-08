import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, MicOff, Settings2, Music2, Guitar, ShieldAlert } from 'lucide-react'
import { usePitchStore } from '../store/pitchStore'
import { usePitchDetection } from '../features/pitch/hooks/usePitchDetection'
import { useChordDetection } from '../features/pitch/hooks/useChordDetection'
import { PitchDisplay } from '../features/pitch/components/PitchDisplay'
import { CentIndicator } from '../features/pitch/components/CentIndicator'
import { ChordDisplay } from '../features/pitch/components/ChordDisplay'
import { MicControls } from '../features/pitch/components/MicControls'
import { PianoRollTimeline } from '../features/pitch/components/PianoRollTimeline'

type MicPermission = 'unknown' | 'granted' | 'denied' | 'prompt'

export default function PitchPage() {
  const { t } = useTranslation()
  const { micGain, noiseThreshold, deviceId, mode, setMicGain, setNoiseThreshold, setDeviceId, setMode } = usePitchStore()
  const [listening, setListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [micPermission, setMicPermission] = useState<MicPermission>('unknown')

  // Check mic permission on mount
  useEffect(() => {
    async function checkPermission() {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          setMicPermission(result.state as MicPermission)
          result.onchange = () => setMicPermission(result.state as MicPermission)
        }
      } catch {
        // permissions API not available (some browsers), that's OK
      }
    }
    checkPermission()
  }, [])

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setMicPermission('granted')
      setListening(true)
    } catch {
      setMicPermission('denied')
    }
  }

  const handleMicToggle = async () => {
    if (listening) {
      setListening(false)
      return
    }
    // If permission unknown or prompt, request it first
    if (micPermission === 'denied') {
      // Can't re-request, show help
      return
    }
    if (micPermission !== 'granted') {
      await requestMicPermission()
    } else {
      setListening(true)
    }
  }

  const pitchResult = usePitchDetection({
    enabled: listening && mode === 'note',
    gain: micGain,
    noiseThreshold,
    deviceId,
  })

  const chordResult = useChordDetection({
    enabled: listening && mode === 'chord',
    gain: micGain,
    noiseThreshold,
    deviceId,
  })

  const error = mode === 'note' ? pitchResult.error : chordResult.error

  // If hook reports error, update permission state
  useEffect(() => {
    if (error && (error.includes('denied') || error.includes('Permission') || error.includes('NotAllowed'))) {
      setMicPermission('denied')
      setListening(false)
    }
  }, [error])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <h1 className="flex-1 font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
          {t('pitchDetection')}
        </h1>
        <button
          onClick={() => setShowSettings((p) => !p)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: showSettings ? 'var(--color-accent-dim)' : 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
        >
          <Settings2 size={18} strokeWidth={1.5} style={{ color: showSettings ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 px-4 pt-4">
        <button
          onClick={() => setMode('note')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: mode === 'note' ? 'var(--color-accent)' : 'var(--color-card)',
            color: mode === 'note' ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          <Music2 size={16} strokeWidth={1.5} />
          {t('pitchModeNote')}
        </button>
        <button
          onClick={() => setMode('chord')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: mode === 'chord' ? 'var(--color-chord)' : 'var(--color-card)',
            color: mode === 'chord' ? '#fff' : 'var(--color-text-secondary)',
          }}
        >
          <Guitar size={16} strokeWidth={1.5} />
          {t('pitchModeChord')}
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 pt-4">
          <MicControls
            gain={micGain}
            threshold={noiseThreshold}
            deviceId={deviceId}
            onGainChange={setMicGain}
            onThresholdChange={setNoiseThreshold}
            onDeviceChange={setDeviceId}
          />
        </div>
      )}

      {/* Permission denied message */}
      {micPermission === 'denied' && (
        <div className="mx-4 mt-4 px-4 py-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <ShieldAlert size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t('pitchMicDenied')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('pitchMicDeniedHint')}
            </p>
          </div>
        </div>
      )}

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {mode === 'note' ? (
          <>
            <PitchDisplay note={pitchResult.note} confidence={pitchResult.confidence} />
            <CentIndicator cents={pitchResult.note?.cents ?? 0} active={!!pitchResult.note} />
          </>
        ) : (
          <ChordDisplay chord={chordResult.chord} confidence={chordResult.confidence} />
        )}
      </div>

      {/* Timeline */}
      <PianoRollTimeline
        noteHistory={pitchResult.history}
        chordHistory={chordResult.history}
        mode={mode}
      />

      {/* Big mic button */}
      <div className="flex justify-center pb-8 pt-4">
        <button
          onClick={handleMicToggle}
          className="rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            width: 80,
            height: 80,
            backgroundColor: micPermission === 'denied'
              ? 'var(--color-text-muted)'
              : listening
                ? 'var(--color-error)'
                : 'var(--color-accent)',
            boxShadow: listening ? '0 0 30px var(--color-error)44' : 'none',
            opacity: micPermission === 'denied' ? 0.5 : 1,
          }}
        >
          {listening
            ? <MicOff size={32} strokeWidth={1.5} color="#fff" />
            : <Mic size={32} strokeWidth={1.5} color="#fff" />
          }
        </button>
      </div>
    </div>
  )
}
