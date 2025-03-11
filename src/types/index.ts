export interface BookContent {
  text: string;
  title: string;
  author?: string;
  format: 'pdf' | 'epub' | 'text';
}

export interface ReadingPosition {
  paragraphIndex: number;
  sentenceIndex: number;
  wordIndex: number;
}

export interface UserPreferences {
  autoScrollSpeed: number; // words per minute
  fontSize: number;
  lineSpacing: number;
  paragraphBackground: string;
  sentenceHighlight: string;
  wordHighlight: string;
  fontFamily: string;
  voice?: string;
}

export interface ReadingProgress {
  position: ReadingPosition;
  timestamp: number;
  bookId: string;
}

export interface BookReaderState {
  content: BookContent | null;
  preferences: UserPreferences;
  progress: ReadingProgress | null;
  isPlaying: boolean;
  isSpeaking: boolean;
} 