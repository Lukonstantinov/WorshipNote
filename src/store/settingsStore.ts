import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instrument, CustomChordDiagram } from '../features/songs/types'

export type Role = 'musician' | 'singer' | 'congregation'
export type Language = 'ru' | 'lt' | 'en'
export type ChordDisplayPosition = 'side' | 'top' | 'none'

const DEFAULT_INSTRUMENTS: Instrument[] = [
  { id: 'guitar', name: 'Guitar', type: 'guitar' },
  { id: 'piano', name: 'Piano', type: 'piano' },
]

interface SettingsStore {
  role: Role
  fontSize: number
  scrollSpeed: number
  language: Language
  instruments: Instrument[]
  selectedInstrument: string
  chordDisplayPosition: ChordDisplayPosition
  customChords: Record<string, CustomChordDiagram>
  tagColors: Record<string, string>
  setRole: (role: Role) => void
  setFontSize: (size: number) => void
  setScrollSpeed: (speed: number) => void
  setLanguage: (lang: Language) => void
  setInstruments: (instruments: Instrument[]) => void
  setSelectedInstrument: (id: string) => void
  setChordDisplayPosition: (pos: ChordDisplayPosition) => void
  setCustomChord: (chord: string, diagram: CustomChordDiagram) => void
  deleteCustomChord: (chord: string) => void
  setTagColor: (tag: string, color: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      role: 'musician',
      fontSize: 20,
      scrollSpeed: 1,
      language: 'ru',
      instruments: DEFAULT_INSTRUMENTS,
      selectedInstrument: 'guitar',
      chordDisplayPosition: 'side',
      customChords: {},
      tagColors: {},
      setRole: (role) => set({ role }),
      setFontSize: (fontSize) => set({ fontSize }),
      setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
      setLanguage: (language) => set({ language }),
      setInstruments: (instruments) => set({ instruments }),
      setSelectedInstrument: (selectedInstrument) => set({ selectedInstrument }),
      setChordDisplayPosition: (chordDisplayPosition) => set({ chordDisplayPosition }),
      setCustomChord: (chord, diagram) =>
        set((s) => ({ customChords: { ...s.customChords, [chord]: diagram } })),
      deleteCustomChord: (chord) =>
        set((s) => {
          const next = { ...s.customChords }
          delete next[chord]
          return { customChords: next }
        }),
      setTagColor: (tag, color) =>
        set((s) => ({ tagColors: { ...s.tagColors, [tag]: color } })),
    }),
    { name: 'worshiphub-settings' }
  )
)
