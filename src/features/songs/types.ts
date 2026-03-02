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

export interface Song {
  id: string;
  title: string;
  original_key?: string;
  bpm?: number;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}
