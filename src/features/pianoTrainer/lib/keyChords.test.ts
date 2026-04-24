import { describe, it, expect } from 'vitest'
import {
  diatonicChords,
  scaleNotes,
  progressionForKey,
  suggestProgression,
  presetsForMode,
  PRESET_PROGRESSIONS,
} from './keyChords'

describe('scaleNotes', () => {
  it('C major = C D E F G A B', () => {
    expect(scaleNotes({ root: 'C', mode: 'major' })).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('G major = G A B C D E F#', () => {
    expect(scaleNotes({ root: 'G', mode: 'major' })).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
  })

  it('A minor = A B C D E F G', () => {
    expect(scaleNotes({ root: 'A', mode: 'minor' })).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('E minor = E F# G A B C D', () => {
    expect(scaleNotes({ root: 'E', mode: 'minor' })).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D'])
  })
})

describe('diatonicChords', () => {
  it('C major → C Dm Em F G Am Bdim', () => {
    expect(diatonicChords({ root: 'C', mode: 'major' }))
      .toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
  })

  it('G major → G Am Bm C D Em F#dim', () => {
    expect(diatonicChords({ root: 'G', mode: 'major' }))
      .toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'])
  })

  it('A minor → Am Bdim C Dm Em F G', () => {
    expect(diatonicChords({ root: 'A', mode: 'minor' }))
      .toEqual(['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'])
  })

  it('D minor → Dm Edim F Gm Am A# C (using sharps)', () => {
    expect(diatonicChords({ root: 'D', mode: 'minor' }))
      .toEqual(['Dm', 'Edim', 'F', 'Gm', 'Am', 'A#', 'C'])
  })
})

describe('progressionForKey', () => {
  it('I–V–vi–IV in C = C G Am F', () => {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === 'pop')!
    expect(progressionForKey(preset, { root: 'C', mode: 'major' }))
      .toEqual(['C', 'G', 'Am', 'F'])
  })

  it('I–V–vi–IV in G = G D Em C', () => {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === 'pop')!
    expect(progressionForKey(preset, { root: 'G', mode: 'major' }))
      .toEqual(['G', 'D', 'Em', 'C'])
  })

  it('ii–V–I in C = Dm G C', () => {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === 'ii-v-i')!
    expect(progressionForKey(preset, { root: 'C', mode: 'major' }))
      .toEqual(['Dm', 'G', 'C'])
  })

  it('i–VII–VI–VII in A minor = Am G F G', () => {
    const preset = PRESET_PROGRESSIONS.find((p) => p.id === 'minor1')!
    expect(progressionForKey(preset, { root: 'A', mode: 'minor' }))
      .toEqual(['Am', 'G', 'F', 'G'])
  })

  it('throws if preset mode does not match key mode', () => {
    const majorPreset = PRESET_PROGRESSIONS.find((p) => p.id === 'pop')!
    expect(() => progressionForKey(majorPreset, { root: 'A', mode: 'minor' })).toThrow()
  })
})

describe('presetsForMode', () => {
  it('major mode returns only major-compatible presets', () => {
    const presets = presetsForMode('major')
    expect(presets.length).toBeGreaterThan(0)
    presets.forEach((p) => expect(p.modes).toContain('major'))
  })

  it('minor mode returns only minor-compatible presets', () => {
    const presets = presetsForMode('minor')
    expect(presets.length).toBeGreaterThan(0)
    presets.forEach((p) => expect(p.modes).toContain('minor'))
  })
})

describe('suggestProgression', () => {
  it('returns a non-empty chord list for a major key', () => {
    const result = suggestProgression({ root: 'C', mode: 'major' }, 0)
    expect(result.length).toBeGreaterThan(0)
  })

  it('same seed + same key → same result', () => {
    const a = suggestProgression({ root: 'C', mode: 'major' }, 3)
    const b = suggestProgression({ root: 'C', mode: 'major' }, 3)
    expect(a).toEqual(b)
  })

  it('different seeds can produce different progressions', () => {
    const key = { root: 'C' as const, mode: 'major' as const }
    const results = new Set<string>()
    for (let i = 0; i < 10; i++) results.add(suggestProgression(key, i).join(','))
    expect(results.size).toBeGreaterThan(1)
  })

  it('handles negative seeds', () => {
    expect(() => suggestProgression({ root: 'C', mode: 'major' }, -1)).not.toThrow()
  })
})
