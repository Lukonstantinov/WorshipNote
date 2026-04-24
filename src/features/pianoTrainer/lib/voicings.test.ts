import { describe, it, expect } from 'vitest'
import {
  parseChord,
  rootPosition,
  pickVoicing,
  bassRoot,
  bassFifth,
  bassThird,
  midiOf,
} from './voicings'

describe('parseChord', () => {
  it('C major', () => {
    expect(parseChord('C')).toEqual({ rootPc: 0, intervals: [0, 4, 7] })
  })
  it('C minor', () => {
    expect(parseChord('Cm')).toEqual({ rootPc: 0, intervals: [0, 3, 7] })
  })
  it('Bdim', () => {
    expect(parseChord('Bdim')).toEqual({ rootPc: 11, intervals: [0, 3, 6] })
  })
  it('F# major', () => {
    expect(parseChord('F#')).toEqual({ rootPc: 6, intervals: [0, 4, 7] })
  })
  it('sus chords', () => {
    expect(parseChord('Csus4').intervals).toEqual([0, 5, 7])
    expect(parseChord('Dsus2').intervals).toEqual([0, 2, 7])
  })
  it('distinguishes m from maj', () => {
    expect(parseChord('Cmaj7').intervals).toEqual([0, 4, 7])
    expect(parseChord('Cm7').intervals).toEqual([0, 3, 7])
  })
  it('throws on nonsense', () => {
    expect(() => parseChord('Zzz')).toThrow()
  })
})

describe('midiOf', () => {
  it('middle C is 60', () => {
    expect(midiOf(0, 4)).toBe(60)
  })
  it('A4 is 69', () => {
    expect(midiOf(9, 4)).toBe(69)
  })
})

describe('rootPosition', () => {
  it('C major near middle C = C4 E4 G4', () => {
    expect(rootPosition('C').notes).toEqual([60, 64, 67])
  })
  it('A minor root position', () => {
    const v = rootPosition('Am')
    expect(v.notes.length).toBe(3)
    // Am root, minor 3rd, 5th — intervals 0,3,7
    expect(v.notes[1] - v.notes[0]).toBe(3)
    expect(v.notes[2] - v.notes[0]).toBe(7)
  })
  it('all triads have 3 notes', () => {
    for (const c of ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']) {
      expect(rootPosition(c).notes.length).toBe(3)
    }
  })
  it('returns fingering for 3 notes = [1,3,5]', () => {
    expect(rootPosition('C').fingers).toEqual([1, 3, 5])
  })
})

describe('pickVoicing', () => {
  it('level 1 → always root position', () => {
    expect(pickVoicing('C', null, 1).notes).toEqual([60, 64, 67])
    // Even with a prev voicing, level 1 ignores it
    expect(pickVoicing('G', { notes: [60, 64, 67], fingers: [1, 3, 5] }, 1))
      .toEqual(rootPosition('G'))
  })

  it('level 2 picks the closest voicing to prev', () => {
    const prev = { notes: [60, 64, 67], fingers: [1, 3, 5] } // C major RH: C4 E4 G4
    const g = pickVoicing('G', prev, 2)
    // Classic smooth voice-leading from C → G: C→B, E→D, G→G  (1st inversion of G)
    expect(g.notes).toEqual([59, 62, 67])
    // Total movement across the 3 voices is just 3 semitones.
    const dist = prev.notes.reduce((acc, n, i) => acc + Math.abs(n - g.notes[i]), 0)
    expect(dist).toBe(3)
  })

  it('level 2 with no prev falls back to root position', () => {
    expect(pickVoicing('F', null, 2).notes).toEqual(rootPosition('F').notes)
  })

  it('smooth voice leading keeps movement small', () => {
    // Running I → V → vi → IV in C, each step should move ≤ a few semitones total.
    const chords = ['C', 'G', 'Am', 'F']
    let prev: ReturnType<typeof pickVoicing> | null = null
    const voicings = chords.map((c) => {
      const v = pickVoicing(c, prev, 2)
      prev = v
      return v
    })
    for (let i = 1; i < voicings.length; i++) {
      const a = voicings[i - 1].notes
      const b = voicings[i].notes
      const dist = a.reduce((acc, n, idx) => acc + Math.abs(n - b[idx]), 0)
      // Smooth voice leading: total movement across 3 voices should be small.
      expect(dist).toBeLessThanOrEqual(6)
    }
  })
})

describe('bass helpers', () => {
  it('bassRoot for C = C2 = 36', () => {
    expect(bassRoot('C')).toBe(36)
  })
  it('bassRoot respects octave arg', () => {
    expect(bassRoot('C', 3)).toBe(48)
  })
  it('bassFifth for C2 is G2', () => {
    expect(bassFifth('C')).toBe(43) // G2 = 43
  })
  it('bassThird matches chord quality (major 3rd for C, minor 3rd for Cm)', () => {
    expect(bassThird('C') - bassRoot('C')).toBe(4)
    expect(bassThird('Cm') - bassRoot('Cm')).toBe(3)
  })
})
