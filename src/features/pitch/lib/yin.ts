/**
 * YIN pitch detection algorithm
 * Based on: "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara (2002)
 */

const DEFAULT_THRESHOLD = 0.15
const DEFAULT_PROBABILITY_THRESHOLD = 0.1

export interface YinResult {
  /** Detected frequency in Hz, or -1 if no pitch detected */
  frequency: number
  /** Probability/confidence of detection (0-1) */
  probability: number
}

/**
 * Compute the autocorrelation-based difference function
 */
function difference(buffer: Float32Array, yinBuffer: Float32Array): void {
  const halfSize = yinBuffer.length
  let delta: number

  for (let tau = 0; tau < halfSize; tau++) {
    yinBuffer[tau] = 0
  }

  for (let tau = 1; tau < halfSize; tau++) {
    for (let i = 0; i < halfSize; i++) {
      delta = buffer[i] - buffer[i + tau]
      yinBuffer[tau] += delta * delta
    }
  }
}

/**
 * Cumulative mean normalized difference function
 */
function cumulativeMeanNormalizedDifference(yinBuffer: Float32Array): void {
  const halfSize = yinBuffer.length
  let runningSum = 0

  yinBuffer[0] = 1

  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] *= tau / runningSum
  }
}

/**
 * Absolute threshold method to find the first dip below threshold
 */
function absoluteThreshold(yinBuffer: Float32Array, threshold: number): number {
  const halfSize = yinBuffer.length
  let tau: number
  let minTau = -1
  let minVal = Infinity

  // Find first tau where the CMND goes below threshold
  for (tau = 2; tau < halfSize; tau++) {
    if (yinBuffer[tau] < threshold) {
      // Find the local minimum after going below threshold
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++
      }
      return tau
    }
    // Track global minimum as fallback
    if (yinBuffer[tau] < minVal) {
      minVal = yinBuffer[tau]
      minTau = tau
    }
  }

  // If no value below threshold, return global minimum if it's reasonable
  if (minVal < DEFAULT_PROBABILITY_THRESHOLD * 10) {
    return minTau
  }

  return -1
}

/**
 * Parabolic interpolation for better frequency resolution
 */
function parabolicInterpolation(yinBuffer: Float32Array, tauEstimate: number): number {
  const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1
  const x2 = tauEstimate + 1 < yinBuffer.length ? tauEstimate + 1 : tauEstimate

  if (x0 === tauEstimate) {
    return yinBuffer[tauEstimate] <= yinBuffer[x2] ? tauEstimate : x2
  }
  if (x2 === tauEstimate) {
    return yinBuffer[tauEstimate] <= yinBuffer[x0] ? tauEstimate : x0
  }

  const s0 = yinBuffer[x0]
  const s1 = yinBuffer[tauEstimate]
  const s2 = yinBuffer[x2]

  return tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
}

/**
 * Run YIN pitch detection on an audio buffer
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  threshold: number = DEFAULT_THRESHOLD
): YinResult {
  const halfSize = Math.floor(buffer.length / 2)
  const yinBuffer = new Float32Array(halfSize)

  difference(buffer, yinBuffer)
  cumulativeMeanNormalizedDifference(yinBuffer)

  const tauEstimate = absoluteThreshold(yinBuffer, threshold)

  if (tauEstimate === -1) {
    return { frequency: -1, probability: 0 }
  }

  const betterTau = parabolicInterpolation(yinBuffer, tauEstimate)
  const frequency = sampleRate / betterTau
  const probability = 1 - yinBuffer[tauEstimate]

  // Sanity check: reject frequencies outside musical range (20Hz - 5000Hz)
  if (frequency < 20 || frequency > 5000) {
    return { frequency: -1, probability: 0 }
  }

  return { frequency, probability }
}
