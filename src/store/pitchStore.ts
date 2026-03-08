import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PitchMode = 'note' | 'chord'

interface PitchStore {
  /** Mic input gain multiplier */
  micGain: number
  /** Noise threshold (RMS level below which signal is ignored) */
  noiseThreshold: number
  /** Selected audio input device ID */
  deviceId: string
  /** Detection mode: single note or chord */
  mode: PitchMode
  setMicGain: (gain: number) => void
  setNoiseThreshold: (threshold: number) => void
  setDeviceId: (id: string) => void
  setMode: (mode: PitchMode) => void
}

export const usePitchStore = create<PitchStore>()(
  persist(
    (set) => ({
      micGain: 1.0,
      noiseThreshold: 0.01,
      deviceId: '',
      mode: 'note' as PitchMode,
      setMicGain: (micGain) => set({ micGain }),
      setNoiseThreshold: (noiseThreshold) => set({ noiseThreshold }),
      setDeviceId: (deviceId) => set({ deviceId }),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'worshiphub-pitch' }
  )
)
