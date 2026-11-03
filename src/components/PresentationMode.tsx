'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Book, Verse, Language } from '@/types';

interface PresentationModeProps {
  verses: Verse[];
  selectedBook: Book;
  selectedChapter: number;
  startVerseIndex: number;
  language: Language;
  onClose: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
}

export function PresentationMode({
  verses,
  selectedBook,
  selectedChapter,
  startVerseIndex,
  language,
  onClose,
  onNextChapter,
  onPrevChapter,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(startVerseIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to the clicked verse when verses/chapter changes
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
      // End of chapter — go to next chapter
      onNextChapter();
      setCurrentIndex(0);
    }
  }, [currentIndex, verses.length, onNextChapter]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Start of chapter — go to prev chapter
      onPrevChapter();
    }
  }, [currentIndex, onPrevChapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
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
      el.requestFullscreen().catch(() => {
        // Fallback: still show the overlay if fullscreen fails
      });
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Close presentation when exiting fullscreen via browser (e.g., F11)
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

  // Dynamically size the font based on text length
  const textLength = verseText.length;
  let slideFontSize = '2.8rem';
  if (textLength > 400) slideFontSize = '1.6rem';
  else if (textLength > 300) slideFontSize = '1.8rem';
  else if (textLength > 200) slideFontSize = '2rem';
  else if (textLength > 120) slideFontSize = '2.4rem';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col select-none"
      style={{ backgroundColor: '#0a0a0a', cursor: 'none' }}
      onClick={goNext}
      onContextMenu={e => { e.preventDefault(); goPrev(); }}
    >
      {/* Top bar: Book / Chapter info */}
      <div
        className="flex items-center justify-between px-10 py-4"
        style={{ cursor: 'default' }}
        onClick={e => e.stopPropagation()}
      >
        <span className="text-white/40 text-sm font-medium tracking-wide uppercase">
          {bookName} — {language === 'sml' ? 'Bindu' : 'Pasal'} {selectedChapter}
        </span>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-lg"
          style={{ cursor: 'pointer' }}
          title="Tutup (Esc)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main verse content — centered */}
      <div className="flex-1 flex items-center justify-center px-16 md:px-24 lg:px-32">
        <div className="max-w-5xl text-center">
          <p
            className="font-serif leading-relaxed text-white"
            style={{
              fontSize: slideFontSize,
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-amber-400/80 font-bold" style={{ fontSize: '0.6em' }}>
              {currentVerse.verse}{' '}
            </span>
            {verseText}
          </p>
        </div>
      </div>

      {/* Bottom bar: navigation + progress */}
      <div
        className="flex items-center justify-between px-10 py-4"
        style={{ cursor: 'default' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Prev button */}
        <button
          onClick={goPrev}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors px-4 py-2 rounded-lg"
          style={{ cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-sm">{language === 'sml' ? 'Parlobei' : 'Sebelumnya'}</span>
        </button>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm font-medium">
            {language === 'sml' ? 'Ayat' : 'Ayat'} {currentVerse.verse} / {verses.length}
          </span>
          {/* Progress bar */}
          <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400/60 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / verses.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          className="flex items-center gap-2 text-white/30 hover:text-white/70 transition-colors px-4 py-2 rounded-lg"
          style={{ cursor: 'pointer' }}
        >
          <span className="text-sm">
            {currentIndex < verses.length - 1
              ? (language === 'sml' ? 'Mangihutni' : 'Selanjutnya')
              : (language === 'sml' ? 'Bindu Mangihutni' : 'Pasal Selanjutnya')}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Keyboard hint — fades after 3s */}
      <style>{`
        @keyframes fadeHint {
          0%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .keyboard-hint {
          animation: fadeHint 4s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
      <div className="keyboard-hint absolute bottom-20 left-1/2 -translate-x-1/2 text-white/20 text-xs text-center">
        ← → {language === 'sml' ? 'laho pindah ayat' : 'untuk navigasi ayat'} • Esc {language === 'sml' ? 'laho tutup' : 'untuk keluar'}
      </div>
    </div>
  );
}
