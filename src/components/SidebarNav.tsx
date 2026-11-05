'use client';

import { useState, useMemo } from 'react';
import type { Book, Language } from '@/types';

interface SidebarNavProps {
  books: Book[];
  selectedBook: Book | null;
  selectedChapter: number;
  language: Language;
  onSelectBook: (book: Book) => void;
  onSelectChapter: (chapter: number) => void;
  onOpenContact?: () => void;
  loading: boolean;
}

export function SidebarNav({
  books,
  selectedBook,
  selectedChapter,
  language,
  onSelectBook,
  onSelectChapter,
  onOpenContact,
  loading,
}: SidebarNavProps) {
  const [expandedBook, setExpandedBook] = useState<number | null>(null);
  const [activeTestament, setActiveTestament] = useState<'PL' | 'PB'>('PL');
  const [collapsed, setCollapsed] = useState(false);

  const filteredBooks = useMemo(
    () => books.filter(b => b.testament === activeTestament),
    [books, activeTestament]
  );

  const handleBookClick = (book: Book) => {
    if (expandedBook === book.id) {
      setExpandedBook(null);
    } else {
      setExpandedBook(book.id);
      onSelectBook(book);
    }
  };

  const handleChapterClick = (book: Book, chapter: number) => {
    onSelectBook(book);
    onSelectChapter(chapter);
  };

  if (collapsed) {
    return (
      <div
        className="w-14 flex flex-col items-center justify-between py-3 border-r transition-all duration-300"
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 rounded-lg transition-transform hover:scale-105 cursor-pointer"
            title="Buka sidebar"
          >
            <img
              src="/logo.png"
              alt="Logo Alkitab"
              className="w-8 h-8 rounded-lg object-contain border shadow-2xs"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </button>
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg transition-colors duration-200 hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--color-text-primary)' }}
            title="Buka sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {onOpenContact && (
          <button
            onClick={onOpenContact}
            className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            title={language === 'sml' ? 'Hubungi Ahu (WA & Gmail)' : 'Hubungi Saya (WA & Gmail)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="w-72 flex flex-col border-r transition-all duration-300 select-none"
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Logo Alkitab"
            className="w-8 h-8 rounded-lg object-contain border shadow-2xs"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <div className="flex flex-col">
            <h1
              className="font-bold text-base leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Alkitab
            </h1>
            <span
              className="text-[10px] font-medium leading-none mt-0.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              © 2026 Delwinro Purba
            </span>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg transition-colors duration-200 hover:opacity-80 cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Tutup sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Testament Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['PL', 'PB'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTestament(t)}
            className="flex-1 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors duration-200"
            style={{
              color: activeTestament === t ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTestament === t ? '2px solid var(--color-accent)' : '2px solid transparent',
              backgroundColor: 'transparent',
            }}
          >
            {t === 'PL'
              ? (language === 'sml' ? 'Padan Nabasaia' : 'Perjanjian Lama')
              : (language === 'sml' ? 'Padan Nabaru' : 'Perjanjian Baru')}
          </button>
        ))}
      </div>

      {/* Book List */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Memuat...
            </div>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id}>
              {/* Book Item */}
              <button
                onClick={() => handleBookClick(book)}
                className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors duration-200"
                style={{
                  backgroundColor:
                    selectedBook?.id === book.id
                      ? 'var(--color-highlight)'
                      : 'transparent',
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    selectedBook?.id === book.id
                      ? 'var(--color-highlight)'
                      : 'var(--color-bg-secondary)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor =
                    selectedBook?.id === book.id
                      ? 'var(--color-highlight)'
                      : 'transparent')
                }
              >
                <span className="text-sm truncate pr-2">
                  {language === 'sml' ? (book.name_sml || book.name) : book.name_id}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {book.total_chapters}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${
                      expandedBook === book.id ? 'rotate-90' : ''
                    }`}
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>

              {/* Chapter Grid (expandable) */}
              {expandedBook === book.id && (
                <div
                  className="px-4 py-2 border-b"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map(
                      ch => (
                        <button
                          key={ch}
                          onClick={() => handleChapterClick(book, ch)}
                          className="py-1.5 text-xs rounded-md font-medium transition-colors duration-200"
                          style={{
                            backgroundColor:
                              selectedBook?.id === book.id && selectedChapter === ch
                                ? 'var(--color-accent)'
                                : 'transparent',
                            color:
                              selectedBook?.id === book.id && selectedChapter === ch
                                ? '#ffffff'
                                : 'var(--color-text-primary)',
                          }}
                          onMouseEnter={e => {
                            if (!(selectedBook?.id === book.id && selectedChapter === ch)) {
                              e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!(selectedBook?.id === book.id && selectedChapter === ch)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {ch}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer: Hubungi Saya */}
      {onOpenContact && (
        <div
          className="p-3 border-t"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-sidebar)',
          }}
        >
          <button
            onClick={onOpenContact}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-200 border cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            title={language === 'sml' ? 'Hubungi Ahu (WA / Gmail)' : 'Hubungi Saya (WA / Gmail)'}
          >
            <span className="text-sm">💬</span>
            <span>{language === 'sml' ? 'Hubungi Ahu' : 'Hubungi Saya'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
