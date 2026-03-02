export type SongSegment = {
  chord?: string;
  text: string;
};

export type SongLine = {
  type: 'lyric' | 'cue' | 'empty';
  cue?: string;
  segments?: SongSegment[];
};

export type ParsedSong = {
  lines: SongLine[];
};

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface Instrument {
  id: string;
  name: string;
  type: 'guitar' | 'piano' | 'bass' | 'ukulele' | 'keyboard' | 'drums' | 'other';
}

export interface CustomChordDiagram {
  /** 6 strings (low E → high e). -1 = muted, 0 = open, 1-5 = fret number */
  frets: number[];
  /** optional finger numbers per string (0 = no finger, 1-4) */
  fingers?: number[];
  /** starting fret number (1 for open-position chords) */
  baseFret?: number;
}

export interface Song {
  id: string;
  title: string;
  original_key?: string;
  bpm?: number;
  content: string;
  tags: string[];
  folderId?: string;
  structure?: string;
  created_at: string;
  updated_at: string;
}
