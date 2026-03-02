import { describe, it, expect } from 'vitest'
import { parseSong } from './parser'

describe('parseSong', () => {
  it('parses block-level cue', () => {
    const result = parseSong('[! ИНТРО: ГИТАРА]')
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0]).toEqual({ type: 'cue', cue: 'ИНТРО: ГИТАРА' })
  })

  it('parses empty line', () => {
    const result = parseSong('\n')
    expect(result.lines[0].type).toBe('empty')
  })

  it('parses lyric line with chords', () => {
    const result = parseSong('[G] Слава Те[Em]бе, Боже')
    expect(result.lines[0].type).toBe('lyric')
    const segs = result.lines[0].segments!
    expect(segs[0].chord).toBe('G')
    expect(segs[0].text).toBe(' Слава Те')
    expect(segs[1].chord).toBe('Em')
    expect(segs[1].text).toBe('бе, Боже')
  })

  it('parses slash chords', () => {
    const result = parseSong('[G/B] test')
    expect(result.lines[0].segments![0].chord).toBe('G/B')
  })

  it('parses lyric-only line', () => {
    const result = parseSong('Просто текст без аккордов')
    expect(result.lines[0].type).toBe('lyric')
    expect(result.lines[0].segments![0].chord).toBeUndefined()
    expect(result.lines[0].segments![0].text).toBe('Просто текст без аккордов')
  })

  it('parses multiple lines', () => {
    const input = `[! ИНТРО: ГИТАРА]
[G] Слава Те[Em]бе, Боже
[! ВСТУПАЮТ БАРАБАНЫ]
[C] Ибо Ты ве[D]лик.`
    const result = parseSong(input)
    expect(result.lines).toHaveLength(4)
    expect(result.lines[0].type).toBe('cue')
    expect(result.lines[1].type).toBe('lyric')
    expect(result.lines[2].type).toBe('cue')
    expect(result.lines[3].type).toBe('lyric')
  })

  it('handles chords with no text after', () => {
    const result = parseSong('[G]  [Am]')
    expect(result.lines[0].type).toBe('lyric')
    expect(result.lines[0].segments).toBeDefined()
  })

  it('handles Cyrillic content', () => {
    const result = parseSong('[Am] Господи, помилуй')
    expect(result.lines[0].segments![0].text).toBe(' Господи, помилуй')
  })
})
