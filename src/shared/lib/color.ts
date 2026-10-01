/**
 * Mix a colour with transparency. Works for hex colours AND CSS variables
 * (`var(--color-info)`), unlike appending a hex alpha suffix such as `+ '22'`.
 */
export function alpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}
