// Database Types for Alkitab

export interface Book {
  id: number;
  order_num: number;
  name: string;
  name_sml?: string;
  name_id: string;
  abbr: string;
  testament: 'PL' | 'PB';
  testament_name: string;
  testament_name_id?: string;
  language: string;
  source: string | null;
  total_chapters: number;
  total_verses: number;
}

export interface Chapter {
  id: number;
  book_id: number;
  chapter: number;
  title: string | null;
  verse_count: number;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_sml: string;
  text_id: string;
}

export interface SearchResult {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_sml: string;
  text_id: string;
  book_name: string;
  book_name_sml?: string;
  book_name_id?: string;
  book_abbr: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  note: string;
  created_at: string;
}

export type Theme = 'light' | 'dark' | 'sepia';

export type Language = 'sml' | 'id';

export interface AppSettings {
  theme: Theme;
  fontSize: number;
  language: Language;
}
