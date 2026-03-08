/**
 * Polyphonic chord detection using chromagram analysis
 */

import { getNoteNames } from './pitchUtils'

const NOTE_NAMES = getNoteNames()

/** Chord template: array of 12 pitch class weights (C through B) */
type ChordTemplate = number[]

interface ChordMatch {
  /** Chord name (e.g. "C", "Am", "G7") */
  name: string
  /** Match score (higher = better match) */
  score: number
}

// Major chord templates (root, major third, fifth)
function majorTemplate(root: number): ChordTemplate {
  const t = new Array(12).fill(0)
  t[root % 12] = 1
  t[(root + 4) % 12] = 0.8
  t[(root + 7) % 12] = 0.8
  return t
}

// Minor chord templates (root, minor third, fifth)
function minorTemplate(root: number): ChordTemplate {
  const t = new Array(12).fill(0)
  t[root % 12] = 1
  t[(root + 3) % 12] = 0.8
  t[(root + 7) % 12] = 0.8
  return t
}

// Dominant 7th
function dom7Template(root: number): ChordTemplate {
  const t = new Array(12).fill(0)
  t[root % 12] = 1
  t[(root + 4) % 12] = 0.7
  t[(root + 7) % 12] = 0.7
  t[(root + 10) % 12] = 0.6
  return t
}

// Build all chord templates
interface ChordDef {
  name: string
  template: ChordTemplate
}

function buildChordTemplates(): ChordDef[] {
  const chords: ChordDef[] = []
  for (let i = 0; i < 12; i++) {
    chords.push({ name: NOTE_NAMES[i], template: majorTemplate(i) })
    chords.push({ name: `${NOTE_NAMES[i]}m`, template: minorTemplate(i) })
    chords.push({ name: `${NOTE_NAMES[i]}7`, template: dom7Template(i) })
  }
  return chords
}

const CHORD_TEMPLATES = buildChordTemplates()

/**
 * Build a chromagram from frequency data
 * Maps FFT bins to 12 pitch classes (C through B)
 */
export function buildChromagram(frequencyData: Uint8Array, sampleRate: number, fftSize: number): Float32Array {
  const chroma = new Float32Array(12)
  const binCount = frequencyData.length

  for (let bin = 1; bin < binCount; bin++) {
    const magnitude = frequencyData[bin] / 255
    if (magnitude < 0.1) continue

    const frequency = (bin * sampleRate) / fftSize
    if (frequency < 60 || frequency > 2000) continue

    // Map frequency to pitch class
    const midi = 12 * Math.log2(frequency / 440) + 69
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12

    chroma[pitchClass] += magnitude * magnitude
  }

  // Normalize
  const max = Math.max(...chroma)
  if (max > 0) {
    for (let i = 0; i < 12; i++) chroma[i] /= max
  }

  return chroma
}

/**
 * Match a chromagram against chord templates
 */
function matchChord(chroma: Float32Array, template: ChordTemplate): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < 12; i++) {
    dot += chroma[i] * template[i]
    normA += chroma[i] * chroma[i]
    normB += template[i] * template[i]
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom > 0 ? dot / denom : 0
}

/**
 * Detect the most likely chord from frequency data
 */
export function detectChord(frequencyData: Uint8Array, sampleRate: number, fftSize: number): ChordMatch | null {
  const chroma = buildChromagram(frequencyData, sampleRate, fftSize)

  // Check if there's enough energy
  const totalEnergy = chroma.reduce((sum, v) => sum + v, 0)
  if (totalEnergy < 0.5) return null

  let bestMatch: ChordMatch | null = null

  for (const chord of CHORD_TEMPLATES) {
    const score = matchChord(chroma, chord.template)
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { name: chord.name, score }
    }
  }

  // Only return if confidence is above threshold
  if (bestMatch && bestMatch.score > 0.6) {
    return bestMatch
  }

  return null
}
