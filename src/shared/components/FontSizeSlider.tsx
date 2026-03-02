import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../../store/settingsStore'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../lib/constants'

export function FontSizeSlider() {
  const { t } = useTranslation()
  const { fontSize, setFontSize } = useSettingsStore()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 whitespace-nowrap">{t('fontSize')}</span>
      <button
        onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
        className="w-9 h-9 rounded-lg font-bold flex items-center justify-center"
        style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
      >
        A-
      </button>
      <span className="text-sm text-gray-300 w-8 text-center">{fontSize}</span>
      <button
        onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
        className="w-9 h-9 rounded-lg font-bold flex items-center justify-center"
        style={{ backgroundColor: '#2d2d4e', color: '#f5f5f5', minWidth: 44, minHeight: 44 }}
      >
        A+
      </button>
    </div>
  )
}
