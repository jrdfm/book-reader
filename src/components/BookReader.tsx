import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useBookReader } from '../context/BookReaderContext';
import { useTextNavigation } from '../hooks/useTextNavigation';
import { useTTS } from '../hooks/useTTS';
import { parseFile } from '../services/fileService';
import TextDisplay from './TextDisplay';
import SettingsOverlay from './SettingsOverlay';
import { FiSettings } from 'react-icons/fi';
import type { ReadingPosition } from '../types';

const KOKORO_API_ENDPOINT = 'http://localhost:8000'; // Update with your Kokoro-FastAPI endpoint
const PARAGRAPHS_PER_PAGE = 2;

interface BookReaderProps {
  file: File;
}

const BookReader: React.FC<BookReaderProps> = ({ file }) => {
  const { state, dispatch } = useBookReader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handlePositionChange = useCallback((position: ReadingPosition) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  }, [dispatch]);

  const {
    position,
    moveToNextWord,
    movePreviousWord,
    moveToNextSentence,
    movePreviousSentence,
    moveToNextParagraph,
    movePreviousParagraph,
  } = useTextNavigation({
    text: state.content?.text || '',
    autoScrollSpeed: state.preferences.autoScrollSpeed,
    isPlaying: state.isPlaying,
    onPositionChange: handlePositionChange,
  });

  const { isLoading: isSpeechLoading, stop: stopSpeech } = useTTS({
    text: state.content?.text || '',
    isPlaying: state.isSpeaking,
    currentPosition: position,
    onPositionChange: handlePositionChange,
    apiEndpoint: KOKORO_API_ENDPOINT,
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await parseFile(file);
      dispatch({ type: 'SET_CONTENT', payload: content });
    } catch (error) {
      console.error('Error parsing file:', error);
      // TODO: Show error message to user
    }
  };

  // Handle keyboard shortcuts for word/sentence navigation and play/pause
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (event.ctrlKey) {
          event.preventDefault();
          moveToNextParagraph();
        } else if (event.shiftKey) {
          event.preventDefault();
          moveToNextSentence();
        } else if (event.altKey) {
          event.preventDefault();
          moveToNextWord();
        }
      } else if (event.key === 'ArrowLeft') {
        if (event.ctrlKey) {
          event.preventDefault();
          movePreviousParagraph();
        } else if (event.shiftKey) {
          event.preventDefault();
          movePreviousSentence();
        } else if (event.altKey) {
          event.preventDefault();
          movePreviousWord();
        }
      } else if (event.key === 'Space') {
        event.preventDefault();
        dispatch({ type: 'TOGGLE_PLAY' });
      }
    },
    [
      dispatch,
      moveToNextWord,
      movePreviousWord,
      moveToNextSentence,
      movePreviousSentence,
      moveToNextParagraph,
      movePreviousParagraph
    ]
  );

  if (!state.content) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Book reader"
    >
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{state.content.title}</h1>
          {state.content.author && (
            <p className="text-[#2B2B2B]">{state.content.author}</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 rounded bg-[#e5decf] hover:bg-[#d8cfc0] text-[#2B2B2B] transition-colors"
            onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
          >
            {state.isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className={`px-3 py-1 rounded ${
              state.isSpeaking ? 'bg-[#e5decf]' : 'bg-[#e5decf]'
            } hover:bg-[#d8cfc0] text-[#2B2B2B] transition-colors`}
            onClick={() => {
              if (state.isSpeaking) {
                stopSpeech();
              }
              dispatch({ type: 'TOGGLE_SPEAK' });
            }}
            disabled={isSpeechLoading}
          >
            {isSpeechLoading
              ? 'Loading...'
              : state.isSpeaking
              ? 'Stop Speaking'
              : 'Start Speaking'}
          </button>
          <button
            className="p-2 rounded hover:bg-[#d8cfc0] text-[#2B2B2B] transition-colors"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
          >
            <FiSettings size={20} />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsOverlay
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <TextDisplay
        text={state.content.text}
        currentPosition={position}
        moveToNextWord={moveToNextWord}
        movePreviousWord={movePreviousWord}
        moveToNextSentence={moveToNextSentence}
        movePreviousSentence={movePreviousSentence}
        moveToNextParagraph={moveToNextParagraph}
        movePreviousParagraph={movePreviousParagraph}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm">Speed:</label>
          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={state.preferences.autoScrollSpeed}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { autoScrollSpeed: Number(e.target.value) },
              })
            }
            className="w-32"
          />
          <span className="text-sm">{state.preferences.autoScrollSpeed} wpm</span>
        </div>
      </div>
    </div>
  );
};

export default BookReader; 