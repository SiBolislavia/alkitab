import Database from '@tauri-apps/plugin-sql';
import type { Book, Chapter, Verse, SearchResult } from '@/types';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:alkitab.db');
  }
  return db;
}

/** Fetch all books ordered by order_num */
export async function getBooks(): Promise<Book[]> {
  const database = await getDb();
  return database.select<Book[]>(
    'SELECT * FROM books ORDER BY order_num ASC'
  );
}

/** Fetch books filtered by testament */
export async function getBooksByTestament(testament: 'PL' | 'PB'): Promise<Book[]> {
  const database = await getDb();
  return database.select<Book[]>(
    'SELECT * FROM books WHERE testament = $1 ORDER BY order_num ASC',
    [testament]
  );
}

/** Fetch chapters for a specific book */
export async function getChapters(bookId: number): Promise<Chapter[]> {
  const database = await getDb();
  return database.select<Chapter[]>(
    'SELECT * FROM chapters WHERE book_id = $1 ORDER BY chapter ASC',
    [bookId]
  );
}

/** Fetch all verses for a specific book and chapter */
export async function getVerses(bookId: number, chapter: number): Promise<Verse[]> {
  const database = await getDb();
  return database.select<Verse[]>(
    'SELECT * FROM verses WHERE book_id = $1 AND chapter = $2 ORDER BY verse ASC',
    [bookId, chapter]
  );
}

/** Full-text search across all verses using FTS5 */
export async function searchVerses(query: string, limit: number = 100): Promise<SearchResult[]> {
  const database = await getDb();
  // Sanitize query for FTS5
  const sanitized = query.replace(/[^\w\s]/gi, '').trim();
  if (!sanitized) return [];

  return database.select<SearchResult[]>(
    `SELECT v.id, v.book_id, v.chapter, v.verse, v.text_sml, v.text_id,
            b.name AS book_name_sml, b.name_id AS book_name_id,
            b.name_id AS book_name, b.abbr AS book_abbr
     FROM verses_fts fts
     JOIN verses v ON v.id = fts.rowid
     JOIN books b ON b.id = v.book_id
     WHERE verses_fts MATCH $1
     ORDER BY fts.rank
     LIMIT $2`,
    [sanitized, limit]
  );
}

/** Get a single book by ID */
export async function getBookById(bookId: number): Promise<Book | null> {
  const database = await getDb();
  const results = await database.select<Book[]>(
    'SELECT * FROM books WHERE id = $1',
    [bookId]
  );
  return results.length > 0 ? results[0] : null;
}
