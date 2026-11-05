'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { PresentationMode } from '@/components/PresentationMode';
import type { Book, Verse, Language, Theme } from '@/types';

interface BibleReaderProps {
  verses: Verse[];
  selectedBook: Book | null;
  selectedChapter: number;
  fontSize: number;
  presentationFontSize: number;
  language: Language;
  theme: Theme;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  loading: boolean;
  error?: string | null;
}

export function BibleReader({
  verses,
  selectedBook,
  selectedChapter,
  fontSize,
  presentationFontSize,
  language,
  theme,
  onPrevChapter,
  onNextChapter,
  loading,
  error,
}: BibleReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [presentationIndex, setPresentationIndex] = useState<number | null>(null);

  // Derive display texts from language to ensure re-render on language change
  const bookDisplayName = useMemo(() => {
    if (!selectedBook) return '';
    return language === 'sml'
      ? (selectedBook.name_sml || selectedBook.name)
      : selectedBook.name_id;
  }, [selectedBook, language]);

  const chapterLabel = language === 'sml' ? 'Bindu' : 'Pasal';

  const displayVerses = useMemo(() => {
    return verses.map(v => ({
      ...v,
      displayText: language === 'sml' ? v.text_sml : v.text_id,
    }));
  }, [verses, language]);

  // Scroll to top when chapter changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBook, selectedChapter]);

  // Keyboard navigation (only when NOT in presentation mode)
  useEffect(() => {
    if (presentationIndex !== null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrevChapter();
      } else if (e.key === 'ArrowRight') {
        onNextChapter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevChapter, onNextChapter, presentationIndex]);

  const handleVerseClick = (index: number) => {
    setPresentationIndex(index);
  };

  const handleClosePresentation = () => {
    setPresentationIndex(null);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Gagal Memuat Database
          </h3>
          <p className="text-sm opacity-80 mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="animate-pulse text-lg">Memuat ayat...</div>
        </div>
      </div>
    );
  }

  if (!selectedBook) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-5xl mb-4">📖</div>
          <p className="text-lg">
            {language === 'sml' ? 'Pilih ayat laho manbasa' : 'Pilih ayat untuk mulai membaca'}
          </p>
        </div>
      </div>
    );
  }

  const canGoPrev = selectedChapter > 1 || (selectedBook.order_num > 1);
  const canGoNext = selectedChapter < selectedBook.total_chapters || (selectedBook.order_num < 66);

  return (
    <>
      {/* Presentation Mode Overlay */}
      {presentationIndex !== null && (
        <PresentationMode
          verses={verses}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          startVerseIndex={presentationIndex}
          language={language}
          theme={theme}
          fontSize={presentationFontSize}
          onClose={handleClosePresentation}
          onNextChapter={onNextChapter}
          onPrevChapter={onPrevChapter}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Reader Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 py-6 md:px-12 lg:px-20"
        >
          {/* Chapter Title */}
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-center font-bold mb-1"
              style={{
                fontSize: `${fontSize + 6}px`,
                color: 'var(--color-text-primary)',
              }}
            >
              {bookDisplayName}
            </h2>
            <p
              className="text-center mb-8 font-medium"
              style={{
                fontSize: `${fontSize - 2}px`,
                color: 'var(--color-text-secondary)',
              }}
            >
              {chapterLabel} {selectedChapter}
            </p>

            {/* Verses */}
            <div className="space-y-1 leading-relaxed mb-12">
              {displayVerses.length === 0 ? (
                <p className="text-center py-8 text-sm opacity-60">
                  {language === 'sml' ? 'Seng dong ayat jumpah bani bindu on.' : 'Tidak ada ayat ditemukan untuk pasal ini.'}
                </p>
              ) : (
                displayVerses.map((v, index) => (
                  <p
                    key={`${v.id}-${language}`}
                    className="group cursor-pointer transition-colors duration-200 rounded-sm px-1 -mx-1"
                    style={{ fontSize: `${fontSize}px` }}
                    onClick={() => handleVerseClick(index)}
                    onMouseEnter={e =>
                      (e.currentTarget.style.backgroundColor = 'var(--color-highlight)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                    title={language === 'sml' ? 'Klik laho tampilkon presentasi' : 'Klik untuk tampilkan presentasi'}
                  >
                    <sup
                      className="font-bold mr-1.5 select-none"
                      style={{
                        fontSize: `${fontSize - 5}px`,
                        color: 'var(--color-verse-num)',
                      }}
                    >
                      {v.verse}
                    </sup>
                    <span style={{ color: 'var(--color-text-verse)' }}>
                      {v.displayText}
                    </span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div
          className="flex items-center justify-between px-6 py-3 border-t"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          <button
            onClick={onPrevChapter}
            disabled={!canGoPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              color: 'var(--color-accent)',
            }}
            onMouseEnter={e => {
              if (canGoPrev) e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {language === 'sml' ? 'Parlobei' : 'Sebelumnya'}
          </button>

          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {bookDisplayName} {selectedChapter} / {selectedBook.total_chapters}
            </span>

            {/* Presentation Mode Button */}
            {verses.length > 0 && (
              <button
                onClick={() => handleVerseClick(0)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = 'var(--color-highlight)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
                title={language === 'sml' ? 'Mode Presentasi (Layar Penuh)' : 'Mode Presentasi (Layar Penuh)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
                {language === 'sml' ? 'Presentasi' : 'Presentasi'}
              </button>
            )}
          </div>

          <button
            onClick={onNextChapter}
            disabled={!canGoNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              color: 'var(--color-accent)',
            }}
            onMouseEnter={e => {
              if (canGoNext) e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {language === 'sml' ? 'Mangihutni' : 'Selanjutnya'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
