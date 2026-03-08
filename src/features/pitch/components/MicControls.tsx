import { useState, useEffect } from 'react'
import { Mic, Volume2 } from 'lucide-react'
import { listAudioDevices } from '../lib/audioCapture'
import { useTranslation } from 'react-i18next'

interface Props {
  gain: number
  threshold: number
  deviceId: string
  onGainChange: (gain: number) => void
  onThresholdChange: (threshold: number) => void
  onDeviceChange: (id: string) => void
}

export function MicControls({ gain, threshold, deviceId, onGainChange, onThresholdChange, onDeviceChange }: Props) {
  const { t } = useTranslation()
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(() => {
    listAudioDevices().then(setDevices).catch(() => {})
  }, [])

  return (
    <div className="space-y-3 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
      {/* Gain slider */}
      <div className="flex items-center gap-3">
        <Volume2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('pitchGain')}</span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{gain.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={gain}
            onChange={(e) => onGainChange(parseFloat(e.target.value))}
            className="w-full accent-current"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* Noise threshold slider */}
      <div className="flex items-center gap-3">
        <Mic size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{t('pitchThreshold')}</span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>{threshold.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* Device selector */}
      {devices.length > 1 && (
        <div>
          <span className="text-xs block mb-1" style={{ color: 'var(--color-text-secondary)' }}>{t('pitchDevice')}</span>
          <select
            value={deviceId}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value="">{t('pitchDefaultDevice')}</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
