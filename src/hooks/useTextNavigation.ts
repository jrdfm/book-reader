import { useState, useCallback, useEffect } from 'react';
import type { ReadingPosition } from '../types';

interface UseTextNavigationProps {
  text: string;
  autoScrollSpeed: number;
  isPlaying: boolean;
  onPositionChange: (position: ReadingPosition) => void;
}

export function useTextNavigation({
  text,
  autoScrollSpeed,
  isPlaying,
  onPositionChange,
}: UseTextNavigationProps) {
  const [position, setPosition] = useState<ReadingPosition>({
    paragraphIndex: 0,
    sentenceIndex: 0,
    wordIndex: 0,
  });

  const paragraphs = text.split(/\n+/);
  
  const splitIntoSentences = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    // Split text into potential sentences, but add a space at the end to help catch the last sentence
    const parts = (trimmedText + ' ').split(/(?<=[.!?])\s+/);
    
    // Process each part to handle special cases
    const sentences = [];
    let currentSentence = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      // Check if this part ends with a sentence-ending punctuation
      if (/[.!?]$/.test(part)) {
        // Check for common abbreviations to avoid splitting them
        if (!/Mr\.|Mrs\.|Dr\.|Ms\.|[A-Z]\.|[0-9]\.$/.test(part)) {
          sentences.push(currentSentence + (currentSentence ? ' ' : '') + part);
          currentSentence = '';
          continue;
        }
      }
      // If we get here, either it's not a sentence end or it's an abbreviation
      currentSentence += (currentSentence ? ' ' : '') + part;
    }

    // Add any remaining text as the final sentence
    if (currentSentence) {
      sentences.push(currentSentence.trim());
    }

    // Filter out any empty sentences and trim all sentences
    return sentences
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());
  }, []);

  const getCurrentParagraph = useCallback(() => {
    return paragraphs[position.paragraphIndex] || '';
  }, [paragraphs, position.paragraphIndex]);

  const getCurrentSentences = useCallback(() => {
    return splitIntoSentences(getCurrentParagraph());
  }, [getCurrentParagraph, splitIntoSentences]);

  const getCurrentWords = useCallback(() => {
    const sentences = getCurrentSentences();
    const currentSentence = sentences[position.sentenceIndex];
    return currentSentence ? currentSentence.match(/\S+/g) || [] : [];
  }, [getCurrentSentences, position.sentenceIndex]);

  const moveToNextWord = useCallback(() => {
    const words = getCurrentWords();
    const sentences = getCurrentSentences();

    if (position.wordIndex < words.length - 1) {
      setPosition((prev) => ({
        ...prev,
        wordIndex: prev.wordIndex + 1,
      }));
    } else if (position.sentenceIndex < sentences.length - 1) {
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: prev.sentenceIndex + 1,
        wordIndex: 0,
      }));
    } else if (position.paragraphIndex < paragraphs.length - 1) {
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: prev.paragraphIndex + 1,
        sentenceIndex: 0,
        wordIndex: 0,
      }));
    }
  }, [getCurrentWords, getCurrentSentences, paragraphs.length, position]);

  const moveToNextSentence = useCallback(() => {
    const sentences = getCurrentSentences();
    const currentSentenceIndex = position.sentenceIndex;

    console.log('Navigation Debug:', {
      currentIndex: currentSentenceIndex,
      totalSentences: sentences.length,
      sentences: sentences,
      currentSentence: sentences[currentSentenceIndex],
      nextSentence: sentences[currentSentenceIndex + 1],
      isLastSentence: currentSentenceIndex === sentences.length - 1
    });

    if (currentSentenceIndex < sentences.length - 1) {
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: currentSentenceIndex + 1,
        wordIndex: 0,
      }));
    } else if (position.paragraphIndex < paragraphs.length - 1) {
      // Check if next paragraph has sentences before moving
      const nextParagraph = paragraphs[position.paragraphIndex + 1];
      const nextSentences = splitIntoSentences(nextParagraph);
      
      console.log('Next Paragraph Debug:', {
        nextParagraphSentences: nextSentences,
        hasNextSentences: nextSentences.length > 0
      });
      
      if (nextSentences.length > 0) {
        setPosition((prev) => ({
          ...prev,
          paragraphIndex: prev.paragraphIndex + 1,
          sentenceIndex: 0,
          wordIndex: 0,
        }));
      }
    }
  }, [getCurrentSentences, paragraphs, position, splitIntoSentences]);

  const moveToNextParagraph = useCallback(() => {
    const currentParagraphIndex = position.paragraphIndex;

    if (currentParagraphIndex < paragraphs.length - 1) {
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: currentParagraphIndex + 1,
        sentenceIndex: 0,
        wordIndex: 0,
      }));
    }
  }, [paragraphs.length, position]);

  const moveToPreviousWord = useCallback(() => {
    if (position.wordIndex > 0) {
      setPosition((prev) => ({
        ...prev,
        wordIndex: prev.wordIndex - 1,
      }));
    } else if (position.sentenceIndex > 0) {
      const prevSentence = getCurrentSentences()[position.sentenceIndex - 1];
      const prevWords = prevSentence.match(/\S+/g) || [];
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: prev.sentenceIndex - 1,
        wordIndex: prevWords.length - 1,
      }));
    } else if (position.paragraphIndex > 0) {
      const prevParagraph = paragraphs[position.paragraphIndex - 1];
      const prevSentences = splitIntoSentences(prevParagraph);
      const lastSentence = prevSentences[prevSentences.length - 1];
      const lastWords = lastSentence.match(/\S+/g) || [];
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: prev.paragraphIndex - 1,
        sentenceIndex: prevSentences.length - 1,
        wordIndex: lastWords.length - 1,
      }));
    }
  }, [getCurrentSentences, paragraphs, position, splitIntoSentences]);

  const movePreviousSentence = useCallback(() => {
    const currentSentenceIndex = position.sentenceIndex;

    if (currentSentenceIndex > 0) {
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: currentSentenceIndex - 1,
        wordIndex: 0,
      }));
    } else if (position.paragraphIndex > 0) {
      const prevParagraph = paragraphs[position.paragraphIndex - 1];
      const prevSentences = splitIntoSentences(prevParagraph);
      
      if (prevSentences.length > 0) {
        setPosition((prev) => ({
          ...prev,
          paragraphIndex: prev.paragraphIndex - 1,
          sentenceIndex: prevSentences.length - 1,
          wordIndex: 0,
        }));
      }
    }
  }, [paragraphs, position, splitIntoSentences]);

  const movePreviousParagraph = useCallback(() => {
    const currentParagraphIndex = position.paragraphIndex;

    if (currentParagraphIndex > 0) {
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: currentParagraphIndex - 1,
        sentenceIndex: 0,
        wordIndex: 0,
      }));
    }
  }, [position]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isPlaying) return;

    const wordsPerMinute = autoScrollSpeed;
    const msPerWord = 60000 / wordsPerMinute;

    const timer = setInterval(() => {
      moveToNextWord();
    }, msPerWord);

    return () => clearInterval(timer);
  }, [isPlaying, autoScrollSpeed, moveToNextWord]);

  // Notify position changes
  useEffect(() => {
    onPositionChange(position);
  }, [position, onPositionChange]);

  return {
    position,
    moveToNextWord,
    movePreviousWord: moveToPreviousWord,
    moveToNextSentence,
    movePreviousSentence,
    moveToNextParagraph,
    movePreviousParagraph,
  };
} 