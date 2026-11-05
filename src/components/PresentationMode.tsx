'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Book, Verse, Language, Theme } from '@/types';

interface PresentationModeProps {
  verses: Verse[];
  selectedBook: Book;
  selectedChapter: number;
  startVerseIndex: number;
  language: Language;
  theme: Theme;
  fontSize: number; // Configured externally from SettingsBar
  onClose: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

// Harmonized color styles for landscape presentation mode
const presentationThemes = {
  dark: {
    screenBg: '#090d16',
    boxBg: 'rgba(15, 23, 42, 0.85)',
    boxBorder: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.7)',
    textColor: '#f8fafc',
    verseNumColor: '#fbbf24', // warm gold
    countColor: 'rgba(248, 250, 252, 0.5)',
  },
  light: {
    screenBg: '#f8fafc',
    boxBg: '#ffffff',
    boxBorder: 'rgba(0, 0, 0, 0.08)',
    boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.08)',
    textColor: '#0f172a',
    verseNumColor: '#2563eb', // sapphire blue
    countColor: 'rgba(15, 23, 42, 0.5)',
  },
  sepia: {
    screenBg: '#f4ebd0',
    boxBg: '#fdf6e3',
    boxBorder: 'rgba(139, 90, 43, 0.18)',
    boxShadow: '0 20px 60px -15px rgba(91, 70, 54, 0.12)',
    textColor: '#3c2817',
    verseNumColor: '#b45309', // warm amber
    countColor: 'rgba(91, 70, 54, 0.55)',
  },
};

export function PresentationMode({
  verses,
  selectedBook,
  selectedChapter,
  startVerseIndex,
  language,
  theme = 'dark',
  fontSize = 42,
  onClose,
  onNextChapter,
  onPrevChapter,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(startVerseIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index when startVerseIndex changes
  useEffect(() => {
    setCurrentIndex(startVerseIndex);
  }, [startVerseIndex, selectedBook, selectedChapter]);

  const currentVerse = verses[currentIndex];
  const bookName = language === 'sml'
    ? (selectedBook.name_sml || selectedBook.name)
    : selectedBook.name_id;
  const verseText = currentVerse
    ? (language === 'sml' ? currentVerse.text_sml : currentVerse.text_id)
    : '';

  const goNext = useCallback(() => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onNextChapter();
      setCurrentIndex(0);
    }
  }, [currentIndex, verses.length, onNextChapter]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      onPrevChapter();
    }
  }, [currentIndex, onPrevChapter]);

  // Keyboard navigation: only space/arrows/enter/esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
        case 'PageDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Request fullscreen on mount
  useEffect(() => {
    const el = containerRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Close when user exits browser fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onClose]);

  if (!currentVerse) return null;

  const currentStyle = presentationThemes[theme] || presentationThemes.dark;

  // Calculate font size based on the user-configured presentationFontSize,
  // scaling proportionally for long verses so text stays in the wide landscape frame
  const textLength = verseText.length;
  let finalFontSizePx = fontSize;
  if (textLength > 360) {
    finalFontSizePx = Math.max(22, Math.round(fontSize * 0.68));
  } else if (textLength > 240) {
    finalFontSizePx = Math.max(24, Math.round(fontSize * 0.78));
  } else if (textLength > 150) {
    finalFontSizePx = Math.max(26, Math.round(fontSize * 0.88));
  }

  // Handle screen click: left 20% goes back, remaining 80% goes forward
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const screenWidth = window.innerWidth;
    if (e.clientX < screenWidth * 0.2) {
      goPrev();
    } else {
      goNext();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col justify-between items-center select-none overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: currentStyle.screenBg,
        cursor: 'none',
      }}
      onClick={handleScreenClick}
      onContextMenu={e => {
        e.preventDefault();
        goPrev();
      }}
    >
      {/* Top spacer for vertical balance */}
      <div className="w-full h-6 md:h-10 flex-shrink-0" />

      {/* Main Content Area - True 16:9 / Widescreen Landscape Layout */}
      <div className="flex-1 w-full max-w-[95vw] xl:max-w-[1450px] 2xl:max-w-[1600px] flex items-center justify-center px-4 md:px-12 py-2">
        {/* Landscape Wide Slide Container */}
        <div
          className="w-full max-h-[78vh] min-h-[50vh] flex items-center justify-center rounded-3xl md:rounded-[36px] border px-10 py-10 md:px-20 md:py-16 lg:px-28 lg:py-20 backdrop-blur-md transition-all duration-300"
          style={{
            backgroundColor: currentStyle.boxBg,
            borderColor: currentStyle.boxBorder,
            boxShadow: currentStyle.boxShadow,
          }}
        >
          {/* Complete Verse Text in Landscape */}
          <p
            className="font-serif leading-[1.65] text-center font-normal tracking-wide w-full"
            style={{
              fontSize: `${finalFontSizePx}px`,
              color: currentStyle.textColor,
              textWrap: 'pretty',
            }}
          >
            <span
              className="font-sans font-bold mr-3.5 inline-block align-baseline"
              style={{
                color: currentStyle.verseNumColor,
                fontSize: '0.85em',
              }}
            >
              {currentVerse.verse}
            </span>
            {verseText}
          </p>
        </div>
      </div>

      {/* Bottom count only: "count dibawah" */}
      <div className="w-full py-5 md:py-7 flex justify-center items-center flex-shrink-0">
        <span
          className="text-xs md:text-sm font-medium tracking-widest uppercase transition-opacity duration-300"
          style={{ color: currentStyle.countColor }}
        >
          {bookName} {selectedChapter}:{currentVerse.verse} • {currentIndex + 1} / {verses.length}
        </span>
      </div>
    </div>
  );
}
