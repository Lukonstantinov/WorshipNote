/**
 * Utilities for pitch/note conversion, filtering, and gating
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const A4_FREQ = 440

export interface NoteInfo {
  /** Note name (e.g. "C#") */
  name: string
  /** Octave number (e.g. 4 for middle C) */
  octave: number
  /** Cents deviation from perfect pitch (-50 to +50) */
  cents: number
  /** Frequency in Hz */
  frequency: number
  /** MIDI note number */
  midi: number
}

/**
 * Convert frequency to the closest note info
 */
export function frequencyToNote(frequency: number): NoteInfo {
  const midi = 12 * Math.log2(frequency / A4_FREQ) + 69
  const roundedMidi = Math.round(midi)
  const cents = Math.round((midi - roundedMidi) * 100)
  const noteIndex = ((roundedMidi % 12) + 12) % 12
  const octave = Math.floor(roundedMidi / 12) - 1

  return {
    name: NOTE_NAMES[noteIndex],
    octave,
    cents,
    frequency,
    midi: roundedMidi,
  }
}

/**
 * Get frequency for a MIDI note number
 */
export function midiToFrequency(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - 69) / 12)
}

/**
 * Note name to pitch class index (0-11)
 */
export function noteToPitchClass(name: string): number {
  return NOTE_NAMES.indexOf(name)
}

/**
 * All 12 note names
 */
export function getNoteNames(): string[] {
  return [...NOTE_NAMES]
}

/**
 * Simple exponential moving average filter for smoothing frequency readings
 */
export function createFrequencyFilter(alpha: number = 0.3) {
  let value = 0
  let initialized = false

  return {
    update(frequency: number): number {
      if (!initialized) {
        value = frequency
        initialized = true
        return frequency
      }
      value = alpha * frequency + (1 - alpha) * value
      return value
    },
    reset(): void {
      initialized = false
      value = 0
    },
  }
}

/**
 * Noise gate: only pass signals above a certain RMS threshold
 */
export function computeRMS(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

/**
 * Check if buffer has enough energy to be considered a real signal
 */
export function isAboveNoiseFloor(buffer: Float32Array, threshold: number = 0.01): boolean {
  return computeRMS(buffer) > threshold
}
