'use client';

import { useState, useEffect, useCallback } from 'react';
import { SidebarNav } from '@/components/SidebarNav';
import { BibleReader } from '@/components/BibleReader';
import { SearchPanel } from '@/components/SearchPanel';
import { SettingsBar } from '@/components/SettingsBar';
import type { Book, Verse, SearchResult, AppSettings } from '@/types';
import * as db from '@/services/dbService';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 18,
  language: 'id',
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isTauri, setIsTauri] = useState(false);

  // Check if running inside Tauri
  useEffect(() => {
    setIsTauri(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window);
  }, []);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alkitab-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppSettings;
        setSettings(parsed);
      } catch {
        // ignore invalid settings
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    localStorage.setItem('alkitab-settings', JSON.stringify(settings));
  }, [settings]);

  // Load books on mount
  useEffect(() => {
    if (!isTauri) return;
    
    async function loadBooks() {
      try {
        setDbError(null);
        const allBooks = await db.getBooks();
        setBooks(allBooks);
        if (allBooks.length > 0) {
          setSelectedBook(allBooks[0]);
        }
      } catch (err) {
        console.error('Failed to load books:', err);
        setDbError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [isTauri]);

  // Load verses when book or chapter changes
  useEffect(() => {
    if (!selectedBook || !isTauri) return;

    async function loadVerses() {
      setLoadingVerses(true);
      try {
        const result = await db.getVerses(selectedBook!.id, selectedChapter);
        setVerses(result);
      } catch (err) {
        console.error('Failed to load verses:', err);
      } finally {
        setLoadingVerses(false);
      }
    }
    loadVerses();
  }, [selectedBook, selectedChapter, isTauri]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await db.searchVerses(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectBook = useCallback((book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowSearch(false);
  }, []);

  const handleSelectChapter = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setShowSearch(false);
  }, []);

  const handleSearchResultClick = useCallback(async (result: SearchResult) => {
    const book = books.find(b => b.id === result.book_id);
    if (book) {
      setSelectedBook(book);
      setSelectedChapter(result.chapter);
      setShowSearch(false);
    }
  }, [books]);

  const handlePrevChapter = useCallback(() => {
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1);
    } else if (selectedBook) {
      const currentIndex = books.findIndex(b => b.id === selectedBook.id);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setSelectedBook(prevBook);
        setSelectedChapter(prevBook.total_chapters);
      }
    }
  }, [selectedChapter, selectedBook, books]);

  const handleNextChapter = useCallback(() => {
    if (selectedBook && selectedChapter < selectedBook.total_chapters) {
      setSelectedChapter(prev => prev + 1);
    } else if (selectedBook) {
      const currentIndex = books.findIndex(b => b.id === selectedBook.id);
      if (currentIndex < books.length - 1) {
        setSelectedBook(books[currentIndex + 1]);
        setSelectedChapter(1);
      }
    }
  }, [selectedChapter, selectedBook, books]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Pre-Tauri / loading state
  if (!isTauri) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">✝️</div>
          <h1 className="text-2xl font-bold mb-2">Alkitab Delwinro</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Memuat aplikasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Sidebar */}
      <SidebarNav
        books={books}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        language={settings.language}
        onSelectBook={handleSelectBook}
        onSelectChapter={handleSelectChapter}
        loading={loading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar: Settings + Search Toggle */}
        <SettingsBar
          settings={settings}
          onUpdateSetting={updateSetting}
          onToggleSearch={() => setShowSearch(prev => !prev)}
          showSearch={showSearch}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
        />

        {/* Search Panel (collapsible) */}
        {showSearch && (
          <SearchPanel
            query={searchQuery}
            results={searchResults}
            isSearching={isSearching}
            language={settings.language}
            onSearch={handleSearch}
            onResultClick={handleSearchResultClick}
          />
        )}

        {/* Bible Reader */}
        <BibleReader
          verses={verses}
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          fontSize={settings.fontSize}
          language={settings.language}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          loading={loading || loadingVerses}
          error={dbError}
        />
      </div>
    </div>
  );
}
