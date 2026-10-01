import { Minus, Plus, RotateCcw } from 'lucide-react'
import { transposeKey } from '../lib/transposer'
import { useTranslation } from 'react-i18next'
import { alpha, keyColor } from '../../../shared/lib/color'

interface Props {
  steps: number
  originalKey?: string
  capoFret: number
  onStepsChange: (steps: number) => void
  onCapoChange: (fret: number) => void
}

const stepBtn: React.CSSProperties = { minWidth: 40, minHeight: 40 }

/** Compact pill controls: [− Key +]  [Capo − n +] */
export function TransposeControls({ steps, originalKey, capoFret, onStepsChange, onCapoChange }: Props) {
  const { t } = useTranslation()

  const effectiveKey = originalKey ? transposeKey(originalKey, steps) : undefined
  const kc = keyColor(effectiveKey)

  return (
    <>
      {/* Transpose */}
      <div
        className="flex items-center rounded-2xl flex-shrink-0"
        style={{ backgroundColor: alpha(kc, 14), border: `1px solid ${alpha(kc, 35)}` }}
        role="group"
        aria-label={t('transpose')}
      >
        <button
          onClick={() => onStepsChange(steps - 1)}
          className="flex items-center justify-center rounded-l-2xl active:scale-90 transition-transform"
          style={{ ...stepBtn, color: kc }}
          title={t('lower')}
          aria-label={t('lower')}
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center leading-none px-1" style={{ minWidth: 44 }}>
          <span className="font-bold text-base" style={{ color: kc }}>{effectiveKey ?? '♪'}</span>
          <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {steps === 0 ? t('key') : steps > 0 ? `+${steps}` : steps}
          </span>
        </div>
        <button
          onClick={() => onStepsChange(steps + 1)}
          className="flex items-center justify-center rounded-r-2xl active:scale-90 transition-transform"
          style={{ ...stepBtn, color: kc }}
          title={t('higher')}
          aria-label={t('higher')}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
      {steps !== 0 && (
        <button
          onClick={() => onStepsChange(0)}
          className="btn-icon flex-shrink-0"
          style={{ minWidth: 40, minHeight: 40 }}
          title={t('resetTranspose')}
          aria-label={t('resetTranspose')}
        >
          <RotateCcw size={15} strokeWidth={2} />
        </button>
      )}

      {/* Capo */}
      <div
        className="flex items-center rounded-2xl flex-shrink-0"
        style={{
          backgroundColor: capoFret > 0 ? 'var(--color-info-dim)' : 'var(--color-card-raised)',
          border: `1px solid ${capoFret > 0 ? alpha('var(--color-info)', 35) : 'transparent'}`,
        }}
        role="group"
        aria-label={t('capo')}
      >
        <button
          onClick={() => onCapoChange(Math.max(0, capoFret - 1))}
          disabled={capoFret === 0}
          className="flex items-center justify-center rounded-l-2xl disabled:opacity-30 active:scale-90 transition-transform"
          style={{ ...stepBtn, color: 'var(--color-info)' }}
          aria-label={`${t('capo')} −`}
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        <div className="flex flex-col items-center leading-none" style={{ minWidth: 40 }}>
          <span className="font-bold text-base" style={{ color: capoFret > 0 ? 'var(--color-info)' : 'var(--color-text-secondary)' }}>
            {capoFret}
          </span>
          <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{t('capo')}</span>
        </div>
        <button
          onClick={() => onCapoChange(Math.min(12, capoFret + 1))}
          className="flex items-center justify-center rounded-r-2xl active:scale-90 transition-transform"
          style={{ ...stepBtn, color: 'var(--color-info)' }}
          aria-label={`${t('capo')} +`}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </>
  )
}
