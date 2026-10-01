/**
 * Mix a colour with transparency. Works for hex colours AND CSS variables
 * (`var(--color-info)`), unlike appending a hex alpha suffix such as `+ '22'`.
 */
export function alpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
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
  if (!m || PITCH[m[1]] === undefined) return 'var(--color-accent)'
  const fifthsPos = (PITCH[m[1]] * 7) % 12
  const minor = /^[A-G][#b]?m(?!aj)/.test(key!.trim())
  const hue = fifthsPos * 30
  // yellows/greens look washed out under white text — darken them a little
  const light = (hue >= 40 && hue <= 100 ? 42 : 52) - (minor ? 4 : 0)
  return `hsl(${hue} ${minor ? 62 : 75}% ${light}%)`
}
