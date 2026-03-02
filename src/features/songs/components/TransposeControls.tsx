import { Minus, Plus } from 'lucide-react'
import { transposeChord } from '../lib/transposer'
import { useTranslation } from 'react-i18next'

interface Props {
  steps: number
  originalKey?: string
  capoFret: number
  onStepsChange: (steps: number) => void
  onCapoChange: (fret: number) => void
}

export function TransposeControls({ steps, originalKey, capoFret, onStepsChange, onCapoChange }: Props) {
  const { t } = useTranslation()

  // Compute the actual transposed key
  const effectiveKey = originalKey
    ? steps !== 0 ? transposeChord(originalKey, steps) : originalKey
    : '–'

  // When capo is set, show what key the guitarist actually plays in
  const capoPlayKey = capoFret > 0 && effectiveKey !== '–'
    ? transposeChord(effectiveKey, -capoFret)
    : null

  const iconStyle = { color: 'rgba(235,235,245,0.7)' }

  return (
    <div
      className="flex flex-wrap items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: '#1c1c1e' }}
    >
      {/* Transpose */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStepsChange(steps - 1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
        >
          <Minus size={16} strokeWidth={2} style={iconStyle} />
        </button>
        <div className="text-center" style={{ minWidth: 52 }}>
          <div className="text-xs" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('transpose')}</div>
          <div className="font-bold text-sm" style={{ color: '#32d74b' }}>
            {steps > 0 ? `+${steps}` : steps}
          </div>
        </div>
        <button
          onClick={() => onStepsChange(steps + 1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
        >
          <Plus size={16} strokeWidth={2} style={iconStyle} />
        </button>
      </div>

      {/* Key display */}
      {originalKey && (
        <div
          className="text-sm px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: '#2c2c2e' }}
        >
          <span style={{ color: 'rgba(235,235,245,0.4)', fontSize: 11 }}>{t('key')} </span>
          <span className="font-semibold" style={{ color: '#bf5af2' }}>{effectiveKey}</span>
        </div>
      )}

      {/* Capo */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('capo')}</span>
        <button
          onClick={() => onCapoChange(Math.max(0, capoFret - 1))}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
        >
          <Minus size={14} strokeWidth={2} style={iconStyle} />
        </button>
        <span className="font-semibold text-sm" style={{ color: '#0a84ff', minWidth: '1ch', textAlign: 'center' }}>
          {capoFret}
        </span>
        <button
          onClick={() => onCapoChange(Math.min(12, capoFret + 1))}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
        >
          <Plus size={14} strokeWidth={2} style={iconStyle} />
        </button>
      </div>

      {/* Capo hint */}
      {capoPlayKey && (
        <div className="text-xs w-full" style={{ color: 'rgba(10,132,255,0.8)' }}>
          {t('capo')} {capoFret} · {t('playAs')} <span className="font-semibold">{capoPlayKey}</span>
        </div>
      )}
    </div>
  )
}
