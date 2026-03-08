/**
 * Web Audio API microphone capture module
 */

export interface AudioCaptureOptions {
  /** FFT/buffer size for analysis (power of 2) */
  bufferSize?: number
  /** Mic gain multiplier */
  gain?: number
  /** Specific audio input device ID */
  deviceId?: string
}

export interface AudioCapture {
  /** The AudioContext instance */
  context: AudioContext
  /** The analyser node for reading time-domain data */
  analyser: AnalyserNode
  /** The gain node for adjusting mic sensitivity */
  gainNode: GainNode
  /** The media stream from the microphone */
  stream: MediaStream
  /** Read current time-domain buffer */
  getTimeDomainData: () => Float32Array
  /** Read current frequency data */
  getFrequencyData: () => Uint8Array
  /** Update gain value */
  setGain: (value: number) => void
  /** Stop capture and release resources */
  stop: () => void
}

/**
 * Start capturing audio from the microphone
 */
export async function startAudioCapture(options: AudioCaptureOptions = {}): Promise<AudioCapture> {
  const { bufferSize = 2048, gain = 1.0, deviceId } = options

  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    },
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  const context = new AudioContext()
  const source = context.createMediaStreamSource(stream)

  const gainNode = context.createGain()
  gainNode.gain.value = gain

  const analyser = context.createAnalyser()
  analyser.fftSize = bufferSize * 2
  analyser.smoothingTimeConstant = 0.1

  source.connect(gainNode)
  gainNode.connect(analyser)

  const timeDomainBuffer = new Float32Array(analyser.fftSize)
  const frequencyBuffer = new Uint8Array(analyser.frequencyBinCount)

  return {
    context,
    analyser,
    gainNode,
    stream,
    getTimeDomainData: () => {
      analyser.getFloatTimeDomainData(timeDomainBuffer)
      return timeDomainBuffer
    },
    getFrequencyData: () => {
      analyser.getByteFrequencyData(frequencyBuffer)
      return frequencyBuffer
    },
    setGain: (value: number) => {
      gainNode.gain.value = value
    },
    stop: () => {
      stream.getTracks().forEach((t) => t.stop())
      source.disconnect()
      gainNode.disconnect()
      analyser.disconnect()
      context.close()
    },
  }
}

/**
 * List available audio input devices
 */
export async function listAudioDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter((d) => d.kind === 'audioinput')
}
