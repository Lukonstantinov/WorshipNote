import { describe, it, expect } from 'vitest'
import { alpha, keyColor } from './color'

describe('alpha', () => {
  it('converts hex colours to rgba (works without color-mix on older iOS)', () => {
    expect(alpha('#ff0000', 50)).toBe('rgba(255, 0, 0, 0.5)')
    expect(alpha('#0f0', 13)).toBe('rgba(0, 255, 0, 0.13)')
  })

  it('adds an alpha channel to hsl colours', () => {
    expect(alpha('hsl(120 75% 52%)', 70)).toBe('hsl(120 75% 52% / 0.7)')
  })

  it('falls back to color-mix for CSS variables', () => {
    expect(alpha('var(--color-info)', 14)).toBe('color-mix(in srgb, var(--color-info) 14%, transparent)')
  })
})

describe('keyColor', () => {
  it('gives related keys related hues and a hex fallback', () => {
    expect(keyColor('C')).toMatch(/^hsl\(0 /)
    expect(keyColor('G')).toMatch(/^hsl\(30 /)
    expect(keyColor('Am')).not.toBe(keyColor('A'))
    expect(keyColor(undefined)).toBe('#a855f7')
  })
})
