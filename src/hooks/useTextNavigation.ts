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
  
  const getCurrentParagraph = useCallback(() => {
    return paragraphs[position.paragraphIndex] || '';
  }, [paragraphs, position.paragraphIndex]);

  const getCurrentSentences = useCallback(() => {
    return getCurrentParagraph().split(/(?<=[.!?])\s+/);
  }, [getCurrentParagraph]);

  const getCurrentWords = useCallback(() => {
    const sentences = getCurrentSentences();
    return sentences[position.sentenceIndex]?.split(/\s+/) || [];
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

    if (currentSentenceIndex < sentences.length - 1) {
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: currentSentenceIndex + 1,
        wordIndex: 0,
      }));
    } else if (position.paragraphIndex < paragraphs.length - 1) {
      // Move to first sentence of next paragraph
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: prev.paragraphIndex + 1,
        sentenceIndex: 0,
        wordIndex: 0,
      }));
    }
  }, [getCurrentSentences, paragraphs.length, position]);

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
      const prevWords = prevSentence.split(/\s+/);
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: prev.sentenceIndex - 1,
        wordIndex: prevWords.length - 1,
      }));
    } else if (position.paragraphIndex > 0) {
      const prevParagraph = paragraphs[position.paragraphIndex - 1];
      const prevSentences = prevParagraph.split(/(?<=[.!?])\s+/);
      const lastSentence = prevSentences[prevSentences.length - 1];
      const lastWords = lastSentence.split(/\s+/);
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: prev.paragraphIndex - 1,
        sentenceIndex: prevSentences.length - 1,
        wordIndex: lastWords.length - 1,
      }));
    }
  }, [getCurrentSentences, paragraphs, position]);

  const movePreviousSentence = useCallback(() => {
    const currentSentenceIndex = position.sentenceIndex;

    if (currentSentenceIndex > 0) {
      setPosition((prev) => ({
        ...prev,
        sentenceIndex: currentSentenceIndex - 1,
        wordIndex: 0,
      }));
    } else if (position.paragraphIndex > 0) {
      // Move to last sentence of previous paragraph
      const prevParagraph = paragraphs[position.paragraphIndex - 1];
      const prevSentences = prevParagraph.split(/(?<=[.!?])\s+/);
      setPosition((prev) => ({
        ...prev,
        paragraphIndex: prev.paragraphIndex - 1,
        sentenceIndex: prevSentences.length - 1,
        wordIndex: 0,
      }));
    }
  }, [paragraphs, position]);

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