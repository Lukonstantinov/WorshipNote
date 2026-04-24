import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PianoKey } from '../features/pianoTrainer/lib/keyChords'
import type { BassPatternId } from '../features/pianoTrainer/lib/bassPatterns'

export type TrainerLevel = 1 | 2 | 3 | 4

interface PianoTrainerState {
  key: PianoKey
  progression: string[]
  level: TrainerLevel
  bassPatternId: BassPatternId
  tempo: number
  /** Seed so the Suggest button cycles through presets. */
  suggestSeed: number

  setKey: (key: PianoKey) => void
  addChord: (chord: string) => void
  removeChordAt: (index: number) => void
  moveChord: (from: number, to: number) => void
  setProgression: (chords: string[]) => void
  clearProgression: () => void
  setLevel: (level: TrainerLevel) => void
  setBassPattern: (id: BassPatternId) => void
  setTempo: (bpm: number) => void
  bumpSuggestSeed: () => void
}

export const usePianoTrainerStore = create<PianoTrainerState>()(
  persist(
    (set) => ({
      key: { root: 'C', mode: 'major' },
      progression: ['C', 'G', 'Am', 'F'],
      level: 1,
      bassPatternId: 'root',
      tempo: 80,
      suggestSeed: 0,

      setKey: (key) => set({ key }),
      addChord: (chord) => set((s) => ({ progression: [...s.progression, chord] })),
      removeChordAt: (index) =>
        set((s) => ({ progression: s.progression.filter((_, i) => i !== index) })),
      moveChord: (from, to) =>
        set((s) => {
          if (from === to || from < 0 || to < 0 || from >= s.progression.length || to >= s.progression.length) {
            return {}
          }
          const next = [...s.progression]
          const [item] = next.splice(from, 1)
          next.splice(to, 0, item)
          return { progression: next }
        }),
      setProgression: (chords) => set({ progression: chords }),
      clearProgression: () => set({ progression: [] }),
      setLevel: (level) => set({ level }),
      setBassPattern: (bassPatternId) => set({ bassPatternId }),
      setTempo: (tempo) => set({ tempo: Math.max(30, Math.min(240, Math.round(tempo))) }),
      bumpSuggestSeed: () => set((s) => ({ suggestSeed: s.suggestSeed + 1 })),
    }),
    { name: 'worshiphub:piano-trainer' }
  )
)
