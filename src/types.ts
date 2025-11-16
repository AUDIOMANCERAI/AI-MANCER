
export type Tab = 'wizard' | 'midi' | 'prompt' | 'file';

export interface Message {
  role: 'user' | 'wizard';
  content: string;
  id: string;
}

export interface MidiNote {
  note: number; // grid index (0-47 for 4 octaves)
  step: number;
  duration: number;
}

export type GenerationType = 'melody' | 'bassline' | 'drums' | 'harmony';

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type Scale = 'Major' | 'Minor' | 'Dorian' | 'Phrygian' | 'Lydian' | 'Mixolydian' | 'Pentatonic';