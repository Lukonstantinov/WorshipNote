/**
 * Mix a colour with transparency. Works for hex colours AND CSS variables
 * (`var(--color-info)`), unlike appending a hex alpha suffix such as `+ '22'`.
 *
 * Hex and hsl() colours become plain rgba()/hsl(… / a) so they also work on
 * older iPhones (color-mix needs iOS 16.2+); only CSS variables use color-mix.
 */
export function alpha(color: string, percent: number): string {
  const a = Math.round(percent) / 100
  const c = color.trim()
  const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((x) => x + x).join('') : hex[1]
    const n = parseInt(h, 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
  }
  const hsl = c.match(/^hsl\(([^/)]+)\)$/i)
  if (hsl) return `hsl(${hsl[1].trim()} / ${a})`
  return `color-mix(in srgb, ${c} ${percent}%, transparent)`
}

const PITCH: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

/**
 * A stable, vibrant colour for a musical key. Keys are placed around the
 * colour wheel in circle-of-fifths order, so related keys get related hues.
 */
export function keyColor(key: string | undefined): string {
  const m = key?.trim().match(/^([A-G][#b]?)/)
  if (!m || PITCH[m[1]] === undefined) return '#a855f7'
  const fifthsPos = (PITCH[m[1]] * 7) % 12
  const minor = /^[A-G][#b]?m(?!aj)/.test(key!.trim())
  const hue = fifthsPos * 30
  // yellows/greens look washed out under white text — darken them a little
  const light = (hue >= 40 && hue <= 100 ? 42 : 52) - (minor ? 4 : 0)
  return `hsl(${hue} ${minor ? 62 : 75}% ${light}%)`
}
