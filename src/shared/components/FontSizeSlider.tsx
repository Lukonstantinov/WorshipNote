import { useSettingsStore } from '../../store/settingsStore'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../lib/constants'

export function FontSizeSlider() {
  const { fontSize, setFontSize } = useSettingsStore()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
        className="flex items-center justify-center rounded-xl font-semibold transition-all"
        style={{
          backgroundColor: '#2c2c2e',
          color: 'rgba(235,235,245,0.6)',
          minWidth: 44,
          minHeight: 44,
          fontSize: 13,
        }}
        title="Уменьшить шрифт"
      >
        A−
      </button>
      <button
        onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
        className="flex items-center justify-center rounded-xl font-semibold transition-all"
        style={{
          backgroundColor: '#2c2c2e',
          color: 'rgba(235,235,245,0.6)',
          minWidth: 44,
          minHeight: 44,
          fontSize: 17,
        }}
        title="Увеличить шрифт"
      >
        A+
      </button>
    </div>
  )
}
