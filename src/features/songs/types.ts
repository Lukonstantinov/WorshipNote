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
  /** strings (low → high). -1 = muted, 0 = open, 1-5 = fret number */
  frets: number[];
  /** optional finger numbers per string (0 = no finger, 1-4) */
  fingers?: number[];
  /** starting fret number (1 for open-position chords) */
  baseFret?: number;
  /** optional text comment displayed below the diagram */
  comment?: string;
}

export interface CustomPianoChordDiagram {
  /** pitch classes to highlight, e.g. ['C', 'E', 'G'] */
  notes: string[];
  /** optional text comment displayed below the diagram */
  comment?: string;
}

export interface ChordRow {
  id: string;
  /** label shown on the left side of the row */
  label?: string;
  /** comment shown below the row */
  comment?: string;
  /** chord names for this row */
  chords: string[];
  /** colour tag for visual distinction */
  color?: string;
  /** dot/highlight colour for chord diagrams in this row */
  dotColor?: string;
  /** true if this row was imported from the chord library */
  fromLibrary?: boolean;
  /** ID of the source progression in chord library */
  libraryProgressionId?: string;
  /** ID of a guitar tab from the library (mutually exclusive with chords) */
  tabId?: string;
  /** whether this row is visible in song view (default true) */
  visible?: boolean;
}

export interface BarProgressionData {
  id: string;
  name: string;
  bars: { chord: string }[][];
  beatsPerBar: number;
}

export type TabInstrument = 'guitar' | 'bass' | 'ukulele'

export interface TabColumn {
  id: string;
  /** true = this column is a bar line separator (|) */
  isSeparator?: boolean;
  /** one cell per string (high → low); null = empty (dash) */
  cells: (number | string | null)[];
}

export interface GuitarTab {
  id: string;
  name: string;
  instrument: TabInstrument;
  columns: TabColumn[];
  description?: string;
  folderId?: string;
  createdAt: string;
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
  /** extra chord rows added by the user (beyond auto-parsed chords) */
  chordRows?: ChordRow[];
  /** bar-by-bar chord progressions saved for this song */
  barProgressions?: BarProgressionData[];
  /** IDs of guitar tabs from the library attached to this song */
  tabIds?: string[];
  /** main vocalist for this song */
  vocalist?: string;
  /** personal musician notes/comments shown below the song in view mode */
  musicianComment?: string;
  /** snapshot of content saved as "original" for restore */
  snapshotContent?: string;
  snapshotSavedAt?: string;
  /** marks this song as a preset variant of another song */
  isPreset?: boolean;
  created_at: string;
  updated_at: string;
}
