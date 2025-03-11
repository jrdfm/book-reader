import React, { useEffect, useRef } from 'react';
import { useBookReader } from '../context/BookReaderContext';
import type { ReadingPosition } from '../types';

interface TextDisplayProps {
  text: string;
  currentPosition: ReadingPosition;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ text, currentPosition }) => {
  const { state, dispatch } = useBookReader();
  const containerRef = useRef<HTMLDivElement>(null);

  // Split text into paragraphs, sentences, and words
  const paragraphs = text.split(/\n+/);
  
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

  return (
    <div
      ref={containerRef}
      className={`text-display min-h-screen p-8 ${
        state.preferences.theme === 'sepia' ? 'bg-[#F4ECD8]' : 'bg-white'
      }`}
      style={{
        fontSize: `${state.preferences.fontSize}px`,
        lineHeight: state.preferences.lineSpacing,
        fontFamily: state.preferences.fontFamily,
        textAlign: state.preferences.textAlign,
        color: '#2B2B2B',
        maxWidth: `${state.preferences.pageWidth}%`,
        margin: '0 auto'
      }}
    >
      {paragraphs.map((paragraph, index) => {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        const isCurrentParagraph = index === currentPosition.paragraphIndex;

        return (
          <p
            key={index}
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
                  ...currentPosition,
                  paragraphIndex: index,
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
                        ...currentPosition,
                        paragraphIndex: index,
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
    </div>
  );
};

export default TextDisplay; 