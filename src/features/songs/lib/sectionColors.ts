// Colour for each kind of song section, so verses/choruses/bridges are easy to spot.
const TYPE_COLORS: [string, string][] = [
  ['PRE-CHORUS', '#06b6d4'],
  ['ПРЕДПРИПЕВ', '#06b6d4'],
  ['КУПЛЕТ', '#3b82f6'],
  ['VERSE', '#3b82f6'],
  ['ПРИПЕВ', '#a855f7'],
  ['CHORUS', '#a855f7'],
  ['РЕФРЕН', '#a855f7'],
  ['МОСТ', '#f97316'],
  ['BRIDGE', '#f97316'],
  ['ВСТУПЛЕНИЕ', '#10b981'],
  ['INTRO', '#10b981'],
  ['ИНТРО', '#10b981'],
  ['ФИНАЛ', '#ef4444'],
  ['OUTRO', '#ef4444'],
  ['ENDING', '#ef4444'],
  ['ОКОНЧАНИЕ', '#ef4444'],
  ['КОДА', '#ef4444'],
  ['ПОВТОР', '#6366f1'],
  ['INTERLUDE', '#ec4899'],
  ['ИНТЕРЛЮДИЯ', '#ec4899'],
  ['SOLO', '#eab308'],
  ['СОЛО', '#eab308'],
  ['TAG', '#0ea5e9'],
  ['ТЕГ', '#0ea5e9'],
  ['INSTRUMENTAL', '#f59e0b'],
  ['ИНСТРУМЕНТАЛ', '#f59e0b'],
]

export function sectionColor(label: string, fallback = 'var(--color-text-tertiary)'): string {
  const up = label.toUpperCase()
  for (const [key, color] of TYPE_COLORS) {
    if (up.includes(key)) return color
  }
  return fallback
}
