import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useBookReader } from '../context/BookReaderContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { ReadingPosition } from '../types';

interface TextDisplayProps {
  text: string;
  currentPosition: ReadingPosition;
  moveToNextWord: () => void;
  movePreviousWord: () => void;
  moveToNextSentence: () => void;
  movePreviousSentence: () => void;
  moveToNextParagraph: () => void;
  movePreviousParagraph: () => void;
}

const PARAGRAPHS_PER_PAGE = 3;

const TextDisplay: React.FC<TextDisplayProps> = ({
  text,
  currentPosition,
  moveToNextWord,
  movePreviousWord,
  moveToNextSentence,
  movePreviousSentence,
  moveToNextParagraph,
  movePreviousParagraph
}) => {
  const { state, dispatch } = useBookReader();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Split text into paragraphs, sentences, and words
  const paragraphs = text.split(/\n+/);
  const totalPages = Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE);
  
  // Get current page's paragraphs
  const startIdx = currentPage * PARAGRAPHS_PER_PAGE;
  const currentPageParagraphs = paragraphs.slice(startIdx, startIdx + PARAGRAPHS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Reset reading position to start of new page
      dispatch({
        type: 'UPDATE_POSITION',
        payload: {
          paragraphIndex: newPage * PARAGRAPHS_PER_PAGE,
          sentenceIndex: 0,
          wordIndex: 0
        }
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (event.ctrlKey) {
        moveToNextParagraph();
      } else if (event.shiftKey) {
        moveToNextSentence();
      } else if (event.altKey) {
        moveToNextWord();
      } else {
        handlePageChange(currentPage + 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (event.ctrlKey) {
        movePreviousParagraph();
      } else if (event.shiftKey) {
        movePreviousSentence();
      } else if (event.altKey) {
        movePreviousWord();
      } else {
        handlePageChange(currentPage - 1);
      }
    } else if (event.key === 'Space') {
      event.preventDefault();
      dispatch({ type: 'TOGGLE_PLAY' });
    }
  }, [currentPage, totalPages, dispatch, moveToNextWord, movePreviousWord, moveToNextSentence, movePreviousSentence, moveToNextParagraph, movePreviousParagraph]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Focus the container when mounted
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to keep current text in view
    if (containerRef.current) {
      const currentElement = containerRef.current.querySelector('[data-current="true"]');
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentPosition]);

  // Update page when paragraphIndex changes
  useEffect(() => {
    const newPage = Math.floor(currentPosition.paragraphIndex / PARAGRAPHS_PER_PAGE);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPosition.paragraphIndex]);

  return (
    <div className="relative min-h-screen" tabIndex={-1}>
      {/* Left navigation area */}
      <div
        className="fixed left-0 top-0 w-16 h-full cursor-pointer"
        onMouseEnter={() => setShowLeftNav(true)}
        onMouseLeave={() => setShowLeftNav(false)}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        {showLeftNav && currentPage > 0 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] opacity-30 hover:opacity-60">
            <FiChevronLeft size={24} />
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className={`text-display p-8 ${
          state.preferences.theme === 'sepia' ? 'bg-[#F4ECD8]' : 'bg-white'
        }`}
        style={{
          fontSize: `${state.preferences.fontSize}px`,
          lineHeight: state.preferences.lineSpacing,
          fontFamily: state.preferences.fontFamily,
          textAlign: state.preferences.textAlign,
          color: '#2B2B2B',
          maxWidth: `${state.preferences.pageWidth}%`,
          margin: '0 auto',
          minHeight: '100vh'
        }}
      >
        {currentPageParagraphs.map((paragraph, index) => {
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          const globalParagraphIndex = startIdx + index;
          const isCurrentParagraph = globalParagraphIndex === currentPosition.paragraphIndex;

          return (
            <p
              key={globalParagraphIndex}
              className={`mb-4 transition-colors duration-200 cursor-pointer ${
                isCurrentParagraph 
                  ? state.preferences.theme === 'sepia' 
                    ? 'bg-[#e5decf] p-4 mx-[-1rem]'
                    : 'bg-[#f5f5f5] p-4 mx-[-1rem]'
                  : ''
              }`}
              onClick={() => {
                dispatch({
                  type: 'UPDATE_POSITION',
                  payload: {
                    paragraphIndex: globalParagraphIndex,
                    sentenceIndex: 0,
                    wordIndex: 0
                  }
                });
              }}
            >
              {sentences.map((sentence, sentenceIndex) => {
                const words = sentence.split(/\s+/);
                const isCurrentSentence =
                  isCurrentParagraph && sentenceIndex === currentPosition.sentenceIndex;

                return (
                  <span
                    key={sentenceIndex}
                    className={`${isCurrentSentence ? 'font-bold' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: 'UPDATE_POSITION',
                        payload: {
                          paragraphIndex: globalParagraphIndex,
                          sentenceIndex: sentenceIndex,
                          wordIndex: 0
                        }
                      });
                    }}
                  >
                    {words.map((word, wordIndex) => {
                      const isCurrentWord =
                        isCurrentSentence && wordIndex === currentPosition.wordIndex;

                      return (
                        <span
                          key={wordIndex}
                          data-current={isCurrentWord}
                          className={isCurrentWord ? 'text-[#000000]' : ''}
                        >
                          {word}
                          {wordIndex < words.length - 1 ? ' ' : ''}
                        </span>
                      );
                    })}
                    {sentenceIndex < sentences.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </p>
          );
        })}

        {/* Page number indicator */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-[#2B2B2B] opacity-60">
          {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* Right navigation area */}
      <div
        className="fixed right-0 top-0 w-16 h-full cursor-pointer"
        onMouseEnter={() => setShowRightNav(true)}
        onMouseLeave={() => setShowRightNav(false)}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        {showRightNav && currentPage < totalPages - 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] opacity-30 hover:opacity-60">
            <FiChevronRight size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextDisplay; 