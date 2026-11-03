'use client';

import { useRef, useEffect, useState } from 'react';
import type { SearchResult, Language } from '@/types';

interface SearchPanelProps {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  language: Language;
  onSearch: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
}

export function SearchPanel({
  query,
  results,
  isSearching,
  language,
  onSearch,
  onResultClick,
}: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const getTextPreview = (result: SearchResult): string => {
    const text = language === 'sml' ? result.text_sml : result.text_id;
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative max-w-2xl mx-auto">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={language === 'sml' ? "Pindahi ayat bani ganup Bibel..." : "Cari ayat di seluruh Alkitab..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none border transition-colors duration-200"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          {isSearching && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Mencari...
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {(results.length > 0 || (localQuery && !isSearching)) && (
        <div
          className="max-h-64 overflow-y-auto border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {results.length === 0 && localQuery && !isSearching ? (
            <div
              className="text-center py-6 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {language === 'sml' ? (
                <>Seng jumpah hasil hubani &ldquo;{localQuery}&rdquo;</>
              ) : (
                <>Tidak ditemukan hasil untuk &ldquo;{localQuery}&rdquo;</>
              )}
            </div>
          ) : (
            <div>
              <div
                className="px-4 py-1.5 text-xs font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {results.length} {language === 'sml' ? 'hasil jumpah' : 'hasil ditemukan'}
              </div>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => onResultClick(r)}
                  className="w-full text-left px-4 py-2.5 border-t transition-colors duration-200"
                  style={{
                    borderColor: 'var(--color-border)',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = 'var(--color-highlight)')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="text-xs font-bold whitespace-nowrap"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {language === 'sml' ? (r.book_name_sml || r.book_name) : (r.book_name_id || r.book_name)} {r.chapter}:{r.verse}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      ({r.book_abbr})
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--color-text-verse)' }}
                  >
                    {getTextPreview(r)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
