import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { BookReaderState, UserPreferences, BookContent, ReadingPosition } from '../types';

const defaultPreferences: UserPreferences = {
  autoScrollSpeed: 200, // words per minute
  fontSize: 16,
  lineSpacing: '1.5',
  paragraphBackground: '#f0f0f0',
  sentenceHighlight: '#e6f3ff',
  wordHighlight: '#b3d9ff',
  fontFamily: 'system-ui',
  textAlign: 'justify',
  theme: 'white',
  pageWidth: 75 // percentage of screen width
};

const initialState: BookReaderState = {
  content: null,
  preferences: defaultPreferences,
  progress: {
    position: {
      paragraphIndex: 0,
      sentenceIndex: 0,
      wordIndex: 0
    },
    timestamp: Date.now(),
    bookId: 'current'
  },
  isPlaying: false,
  isSpeaking: false,
};

type Action =
  | { type: 'SET_CONTENT'; payload: BookContent }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_POSITION'; payload: ReadingPosition }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'TOGGLE_SPEAK' };

function reducer(state: BookReaderState, action: Action): BookReaderState {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        progress: state.progress
          ? { ...state.progress, position: { ...state.progress.position, ...action.payload } }
          : { position: action.payload, timestamp: Date.now(), bookId: 'current' },
      };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'TOGGLE_SPEAK':
      return { ...state, isSpeaking: !state.isSpeaking };
    default:
      return state;
  }
}

const BookReaderContext = createContext<{
  state: BookReaderState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function BookReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('bookReaderPreferences');
    if (savedPreferences) {
      dispatch({
        type: 'UPDATE_PREFERENCES',
        payload: JSON.parse(savedPreferences),
      });
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bookReaderPreferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  return (
    <BookReaderContext.Provider value={{ state, dispatch }}>
      {children}
    </BookReaderContext.Provider>
  );
}

export function useBookReader() {
  const context = useContext(BookReaderContext);
  if (!context) {
    throw new Error('useBookReader must be used within a BookReaderProvider');
  }
  return context;
} 