type AudioSessionType = 'auto' | 'playback' | 'play-and-record'

/**
 * Tell iOS what kind of audio this is (Safari 16.4+). 'playback' makes the
 * metronome / piano audible even when the iPhone's silent switch is on.
 * No-op elsewhere.
 */
export function setAudioSessionType(type: AudioSessionType): void {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: AudioSessionType } }).audioSession
    if (session) session.type = type
  } catch {
    // not supported
  }
}

/** Create an AudioContext for music playback (older iOS needs the webkit prefix). */
export function createPlaybackAudioContext(): AudioContext {
  setAudioSessionType('playback')
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  return new Ctor()
}
