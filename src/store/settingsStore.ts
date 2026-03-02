import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'musician' | 'singer' | 'congregation'
export type Language = 'ru' | 'lt' | 'en'

interface SettingsStore {
  role: Role
  fontSize: number
  scrollSpeed: number
  language: Language
  setRole: (role: Role) => void
  setFontSize: (size: number) => void
  setScrollSpeed: (speed: number) => void
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      role: 'musician',
      fontSize: 20,
      scrollSpeed: 1,
      language: 'ru',
      setRole: (role) => set({ role }),
      setFontSize: (fontSize) => set({ fontSize }),
      setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'worshiphub-settings' }
  )
)
