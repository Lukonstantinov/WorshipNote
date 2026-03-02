export const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
]

export const MINOR_KEYS = KEYS.map((k) => k + 'm')
export const ALL_KEYS = [...KEYS, ...MINOR_KEYS]

export const FONT_SIZE_MIN = 14
export const FONT_SIZE_MAX = 36
export const FONT_SIZE_DEFAULT = 20
