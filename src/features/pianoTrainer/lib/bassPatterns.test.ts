import { describe, it, expect } from 'vitest'
import { BASS_PATTERNS, getBassPattern } from './bassPatterns'

describe('BASS_PATTERNS', () => {
  it('has the expected ids', () => {
    const ids = BASS_PATTERNS.map((p) => p.id)
    expect(ids).toEqual(['root', 'rootOct', 'root5oct5', 'alberti', 'walking'])
  })

  it('every pattern produces at least one note for any chord', () => {
    for (const p of BASS_PATTERNS) {
      const notes = p.notesForBar('C')
      expect(notes.length).toBeGreaterThan(0)
    }
  })

  it('all notes have duration > 0 and valid LH fingering', () => {
    for (const p of BASS_PATTERNS) {
      for (const n of p.notesForBar('Am')) {
        expect(n.beats).toBeGreaterThan(0)
        expect(n.finger).toBeGreaterThanOrEqual(1)
        expect(n.finger).toBeLessThanOrEqual(5)
      }
    }
  })

  it('start beats + durations cover or fit within a 4-beat bar', () => {
    for (const p of BASS_PATTERNS) {
      for (const n of p.notesForBar('F')) {
        expect(n.startBeat).toBeGreaterThanOrEqual(0)
        expect(n.startBeat + n.beats).toBeLessThanOrEqual(4)
      }
    }
  })

  it('notes stay in a sensible LH MIDI range (C1..C4 ≈ 24..60)', () => {
    for (const p of BASS_PATTERNS) {
      for (const n of p.notesForBar('G')) {
        expect(n.midi).toBeGreaterThanOrEqual(24)
        expect(n.midi).toBeLessThanOrEqual(60)
      }
    }
  })
})

describe('root pattern', () => {
  it('C → single low C2 for 4 beats', () => {
    const notes = getBassPattern('root').notesForBar('C')
    expect(notes).toEqual([{ midi: 36, startBeat: 0, beats: 4, finger: 5 }])
  })
})

describe('rootOct pattern', () => {
  it('C → C2 then C3', () => {
    const notes = getBassPattern('rootOct').notesForBar('C')
    expect(notes.map((n) => n.midi)).toEqual([36, 48])
    expect(notes[0].beats).toBe(2)
    expect(notes[1].beats).toBe(2)
  })
})

describe('root5oct5 pattern', () => {
  it('C → C2, G2, C3, G2', () => {
    const notes = getBassPattern('root5oct5').notesForBar('C')
    expect(notes.map((n) => n.midi)).toEqual([36, 43, 48, 43])
  })

  it('each note lasts 1 beat', () => {
    const notes = getBassPattern('root5oct5').notesForBar('F')
    for (const n of notes) expect(n.beats).toBe(1)
  })
})

describe('alberti pattern', () => {
  it('Cm → C2, G2, Eb2 (minor 3rd), G2', () => {
    const notes = getBassPattern('alberti').notesForBar('Cm')
    expect(notes.map((n) => n.midi)).toEqual([36, 43, 39, 43])
  })

  it('C (major) → C2, G2, E2, G2', () => {
    const notes = getBassPattern('alberti').notesForBar('C')
    expect(notes.map((n) => n.midi)).toEqual([36, 43, 40, 43])
  })
})

describe('walking pattern', () => {
  it('C → C2, E2, G2, A2', () => {
    const notes = getBassPattern('walking').notesForBar('C')
    expect(notes.map((n) => n.midi)).toEqual([36, 40, 43, 45])
  })
})

describe('getBassPattern', () => {
  it('returns the pattern for a known id', () => {
    expect(getBassPattern('root').id).toBe('root')
  })
  it('throws for unknown id', () => {
    expect(() => getBassPattern('nope')).toThrow()
  })
})
