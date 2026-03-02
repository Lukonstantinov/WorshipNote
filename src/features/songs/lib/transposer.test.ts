import { describe, it, expect } from 'vitest'
import { transposeChord, transposeSong, getCapoDisplay } from './transposer'

describe('transposeChord', () => {
  it('transposes C up by 2 semitones → D', () => {
    expect(transposeChord('C', 2)).toBe('D')
  })

  it('transposes G up by 5 semitones → C', () => {
    expect(transposeChord('G', 5)).toBe('C')
  })

  it('transposes Am up by 3 semitones → Cm', () => {
    expect(transposeChord('Am', 3)).toBe('Cm')
  })

  it('preserves quality (m7, maj7, dim, etc.)', () => {
    expect(transposeChord('Am7', 2)).toBe('Bm7')
    expect(transposeChord('Gmaj7', 1)).toBe('G#maj7')
    expect(transposeChord('Cdim', 3)).toBe('D#dim') // C is sharp key, so D# not Eb
  })

  it('handles slash chords', () => {
    expect(transposeChord('G/B', 2)).toBe('A/C#')
  })

  it('wraps around 12 semitones', () => {
    expect(transposeChord('B', 1)).toBe('C')
  })

  it('handles flats correctly', () => {
    expect(transposeChord('Bb', 2)).toBe('C')
    expect(transposeChord('Eb', 1)).toBe('E')
  })

  it('returns same chord if steps = 0', () => {
    expect(transposeChord('Am', 0)).toBe('Am')
  })

  it('handles negative steps', () => {
    expect(transposeChord('D', -2)).toBe('C')
  })
})

describe('transposeSong', () => {
  it('transposes all chords in content', () => {
    const input = '[G] Слава Те[Em]бе'
    const result = transposeSong(input, 2)
    expect(result).toBe('[A] Слава Те[F#m]бе')
  })

  it('does not transpose cue annotations', () => {
    const input = '[! ИНТРО]\n[G] text'
    const result = transposeSong(input, 2)
    expect(result).toContain('[! ИНТРО]')
    expect(result).toContain('[A]')
  })

  it('returns unchanged if steps = 0', () => {
    const input = '[G] text [Am] more'
    expect(transposeSong(input, 0)).toBe(input)
  })
})

describe('getCapoDisplay', () => {
  it('returns key if capo is 0', () => {
    expect(getCapoDisplay('G', 0)).toBe('G')
  })

  it('returns capo info string', () => {
    const result = getCapoDisplay('Bb', 3)
    expect(result).toContain('Каподастр: 3')
    expect(result).toContain('Играть как')
  })
})
