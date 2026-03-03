import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instrument, CustomChordDiagram, CustomPianoChordDiagram } from '../features/songs/types'

export type Role = 'musician' | 'singer' | 'congregation'
export type Language = 'ru' | 'lt' | 'en'
export type ChordDisplayPosition = 'side' | 'top' | 'none'
export type ChordDiagramMode = 'single' | 'all' | 'mini'

export interface CustomRole {
  id: string
  name: string
  showChords: boolean
  showCues: boolean
  showDiagrams: boolean
}

const DEFAULT_INSTRUMENTS: Instrument[] = [
  { id: 'guitar', name: 'Guitar', type: 'guitar' },
  { id: 'piano', name: 'Piano', type: 'piano' },
]

interface SettingsStore {
  role: Role | string
  fontSize: number
  scrollSpeed: number
  language: Language
  instruments: Instrument[]
  selectedInstrument: string
  chordDisplayPosition: ChordDisplayPosition
  chordDiagramMode: ChordDiagramMode
  customChords: Record<string, CustomChordDiagram>
  customPianoChords: Record<string, CustomPianoChordDiagram>
  tagColors: Record<string, string>
  roleLabels: Record<string, string>
  customRoles: CustomRole[]
  /** flip guitar fret diagrams (mirror left↔right, for left-handed or preferred view) */
  guitarFlipped: boolean
  /** colour of finger dots on guitar diagrams */
  guitarDotColor: string
  /** colour used to highlight piano keys */
  pianoHighlightColor: string
  /** scale multiplier for chord diagrams (0.75 | 1 | 1.5 | 2) */
  diagramScale: number
  setRole: (role: Role | string) => void
  setFontSize: (size: number) => void
  setScrollSpeed: (speed: number) => void
  setLanguage: (lang: Language) => void
  setInstruments: (instruments: Instrument[]) => void
  setSelectedInstrument: (id: string) => void
  setChordDisplayPosition: (pos: ChordDisplayPosition) => void
  setChordDiagramMode: (mode: ChordDiagramMode) => void
  setCustomChord: (chord: string, diagram: CustomChordDiagram) => void
  deleteCustomChord: (chord: string) => void
  setCustomPianoChord: (chord: string, diagram: CustomPianoChordDiagram) => void
  deleteCustomPianoChord: (chord: string) => void
  setTagColor: (tag: string, color: string) => void
  setRoleLabel: (roleId: string, label: string) => void
  addCustomRole: (role: CustomRole) => void
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void
  deleteCustomRole: (id: string) => void
  setGuitarFlipped: (flipped: boolean) => void
  setGuitarDotColor: (color: string) => void
  setPianoHighlightColor: (color: string) => void
  setDiagramScale: (scale: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      role: 'musician' as Role | string,
      fontSize: 20,
      scrollSpeed: 1,
      language: 'ru' as Language,
      instruments: DEFAULT_INSTRUMENTS,
      selectedInstrument: 'guitar',
      chordDisplayPosition: 'side' as ChordDisplayPosition,
      chordDiagramMode: 'single' as ChordDiagramMode,
      customChords: {} as Record<string, CustomChordDiagram>,
      customPianoChords: {} as Record<string, CustomPianoChordDiagram>,
      tagColors: {} as Record<string, string>,
      roleLabels: {} as Record<string, string>,
      customRoles: [] as CustomRole[],
      guitarFlipped: false,
      guitarDotColor: '#bf5af2',
      pianoHighlightColor: '#32d74b',
      diagramScale: 1,
      setRole: (role) => set({ role }),
      setFontSize: (fontSize) => set({ fontSize }),
      setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
      setLanguage: (language) => set({ language }),
      setInstruments: (instruments) => set({ instruments }),
      setSelectedInstrument: (selectedInstrument) => set({ selectedInstrument }),
      setChordDisplayPosition: (chordDisplayPosition) => set({ chordDisplayPosition }),
      setChordDiagramMode: (chordDiagramMode) => set({ chordDiagramMode }),
      setCustomChord: (chord, diagram) =>
        set((s) => ({ customChords: { ...s.customChords, [chord]: diagram } })),
      deleteCustomChord: (chord) =>
        set((s) => {
          const next = { ...s.customChords }
          delete next[chord]
          return { customChords: next }
        }),
      setCustomPianoChord: (chord, diagram) =>
        set((s) => ({ customPianoChords: { ...s.customPianoChords, [chord]: diagram } })),
      deleteCustomPianoChord: (chord) =>
        set((s) => {
          const next = { ...s.customPianoChords }
          delete next[chord]
          return { customPianoChords: next }
        }),
      setTagColor: (tag, color) =>
        set((s) => ({ tagColors: { ...s.tagColors, [tag]: color } })),
      setRoleLabel: (roleId, label) =>
        set((s) => ({ roleLabels: { ...s.roleLabels, [roleId]: label } })),
      addCustomRole: (role) =>
        set((s) => ({ customRoles: [...s.customRoles, role] })),
      updateCustomRole: (id, updates) =>
        set((s) => ({
          customRoles: s.customRoles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteCustomRole: (id) =>
        set((s) => ({
          customRoles: s.customRoles.filter((r) => r.id !== id),
          role: s.role === id ? 'musician' : s.role,
        })),
      setGuitarFlipped: (guitarFlipped) => set({ guitarFlipped }),
      setGuitarDotColor: (guitarDotColor) => set({ guitarDotColor }),
      setPianoHighlightColor: (pianoHighlightColor) => set({ pianoHighlightColor }),
      setDiagramScale: (diagramScale) => set({ diagramScale }),
    }),
    { name: 'worshiphub-settings' }
  )
)
