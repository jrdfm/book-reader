import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReadingPosition } from '../types';

interface UseTTSProps {
  text: string;
  isPlaying: boolean;
  currentPosition: ReadingPosition;
  onPositionChange: (position: ReadingPosition) => void;
  apiEndpoint: string;
}

export function useTTS({
  text,
  isPlaying,
  currentPosition,
  onPositionChange,
  apiEndpoint,
}: UseTTSProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCurrentText = useCallback(() => {
    const paragraphs = text.split(/\n+/);
    const currentParagraph = paragraphs[currentPosition.paragraphIndex];
    if (!currentParagraph) return '';

    const sentences = currentParagraph.split(/(?<=[.!?])\s+/);
    const currentSentence = sentences[currentPosition.sentenceIndex];
    if (!currentSentence) return '';

    return currentSentence;
  }, [text, currentPosition]);

  const generateSpeech = useCallback(async (text: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'kokoro-82m',
          input: text,
          voice: 'default', // Can be configurable later
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsLoading(false);
      return url;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Speech generation aborted');
      } else {
        console.error('Error generating speech:', error);
      }
      setIsLoading(false);
      return null;
    }
  }, [apiEndpoint]);

  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [audioUrl]);

  // Handle audio playback
  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const playCurrentSentence = async () => {
      const text = getCurrentText();
      if (!text) return;

      const url = await generateSpeech(text);
      if (!url) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = url;
      audioRef.current.play();

      audioRef.current.onended = () => {
        // Move to next sentence when audio finishes
        const paragraphs = text.split(/\n+/);
        const sentences = paragraphs[currentPosition.paragraphIndex]?.split(/(?<=[.!?])\s+/) || [];

        if (currentPosition.sentenceIndex < sentences.length - 1) {
          onPositionChange({
            ...currentPosition,
            sentenceIndex: currentPosition.sentenceIndex + 1,
            wordIndex: 0,
          });
        } else if (currentPosition.paragraphIndex < paragraphs.length - 1) {
          onPositionChange({
            ...currentPosition,
            paragraphIndex: currentPosition.paragraphIndex + 1,
            sentenceIndex: 0,
            wordIndex: 0,
          });
        }
      };
    };

    playCurrentSentence();
  }, [isPlaying, getCurrentText, generateSpeech, currentPosition, onPositionChange]);

  return {
    isLoading,
    stop: useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, []),
  };
} 