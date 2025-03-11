export interface ReadingPosition {
  paragraphIndex: number;
  sentenceIndex: number;
  wordIndex: number;
}

export interface Page {
  content: string;
  number: number;
  paragraphs: string[];
}

export interface PageMetadata {
  pageNumber: number;
  startParagraphIndex: number;
  endParagraphIndex: number;
}

export interface BookContent {
  text: string;
  title: string;
  author?: string;
  format: 'pdf' | 'epub' | 'text';
  pages?: PageMetadata[];
  originalParagraphStructure?: boolean;
}

export interface UserPreferences {
  fontSize: number;
  fontFamily: string;
  lineSpacing: string;
  autoScrollSpeed: number;
  textAlign: 'justify' | 'left';
  theme: 'white' | 'sepia';
  paragraphBackground: string;
  sentenceHighlight: string;
  wordHighlight: string;
  pageWidth: number;
}

export interface BookReaderState {
  content: BookContent | null;
  preferences: UserPreferences;
  progress: { position: ReadingPosition; timestamp: number; bookId: string } | null;
  isPlaying: boolean;
  isSpeaking: boolean;
} 