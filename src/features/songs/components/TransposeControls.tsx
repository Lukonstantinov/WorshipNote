import { useTranslation } from 'react-i18next'
import { getCapoDisplay } from '../lib/transposer'

interface Props {
  steps: number
  originalKey?: string
  capoFret: number
  onStepsChange: (steps: number) => void
  onCapoChange: (fret: number) => void
}

export function TransposeControls({ steps, originalKey, capoFret, onStepsChange, onCapoChange }: Props) {
  const { t } = useTranslation()

  const effectiveKey = originalKey
    ? `${originalKey}` // simplified; could compute actual transposed key
    : '–'

  return (
    <div
      className="flex flex-wrap items-center gap-4 p-3 rounded-xl"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      {/* Transpose */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStepsChange(steps - 1)}
          className="w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center"
          style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
        >
          −
        </button>
        <div className="text-center min-w-16">
          <div className="text-xs text-gray-400">{t('transpose')}</div>
          <div className="font-bold" style={{ color: '#4ade80' }}>
            {steps > 0 ? `+${steps}` : steps}
          </div>
        </div>
        <button
          onClick={() => onStepsChange(steps + 1)}
          className="w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center"
          style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
        >
          +
        </button>
      </div>

      {/* Key display */}
      {originalKey && (
        <div className="text-sm">
          <span className="text-gray-400">{t('key')}: </span>
          <span style={{ color: '#a78bfa' }}>{effectiveKey}</span>
        </div>
      )}

      {/* Capo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{t('capo')}:</span>
        <button
          onClick={() => onCapoChange(Math.max(0, capoFret - 1))}
          className="w-8 h-8 rounded-lg font-bold flex items-center justify-center"
          style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
        >
          −
        </button>
        <span style={{ color: '#60a5fa', minWidth: '1ch', textAlign: 'center' }}>{capoFret}</span>
        <button
          onClick={() => onCapoChange(Math.min(12, capoFret + 1))}
          className="w-8 h-8 rounded-lg font-bold flex items-center justify-center"
          style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
        >
          +
        </button>
      </div>

      {capoFret > 0 && originalKey && (
        <div className="text-xs w-full" style={{ color: '#60a5fa' }}>
          {getCapoDisplay(originalKey, capoFret)}
        </div>
      )}
    </div>
  )
}
