import Database from '@tauri-apps/plugin-sql';
import type { Book, Chapter, Verse, SearchResult } from '@/types';

const DB_CONNECTION = 'sqlite:alkitab.db';
let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = Database.get(DB_CONNECTION);
  }
  return db;
}

/** Fetch all books ordered by order_num */
export async function getBooks(limit: number = 66): Promise<Book[]> {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 66;
  const database = await getDb();
  return database.select<Book[]>(
    'SELECT id, name, name_id, name_sml, abbr, testament, total_chapters, order_num FROM books WHERE order_num >= $1 ORDER BY order_num ASC LIMIT $2',
    [1, safeLimit]
  );
}

/** Fetch books filtered by testament */
export async function getBooksByTestament(testament: 'PL' | 'PB'): Promise<Book[]> {
  if (testament !== 'PL' && testament !== 'PB') {
    return [];
  }
  const database = await getDb();
  return database.select<Book[]>(
    'SELECT id, name, name_id, name_sml, abbr, testament, total_chapters, order_num FROM books WHERE testament = $1 ORDER BY order_num ASC',
    [testament]
  );
}

/** Fetch chapters for a specific book */
export async function getChapters(bookId: number): Promise<Chapter[]> {
  if (!Number.isInteger(bookId) || bookId < 1) {
    return [];
  }
  const database = await getDb();
  return database.select<Chapter[]>(
    'SELECT id, book_id, chapter, total_verses FROM chapters WHERE book_id = $1 ORDER BY chapter ASC',
    [bookId]
  );
}

/** Fetch all verses for a specific book and chapter */
export async function getVerses(bookId: number, chapter: number): Promise<Verse[]> {
  if (!Number.isInteger(bookId) || bookId < 1 || !Number.isInteger(chapter) || chapter < 1) {
    return [];
  }
  const database = await getDb();
  return database.select<Verse[]>(
    'SELECT id, book_id, chapter, verse, text_sml, text_id FROM verses WHERE book_id = $1 AND chapter = $2 ORDER BY verse ASC',
    [bookId, chapter]
  );
}

/** Full-text search across all verses using FTS5 */
export async function searchVerses(query: string, limit: number = 100): Promise<SearchResult[]> {
  const sanitized = query
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\b(?:AND|OR|NOT|NEAR)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) {
    return [];
  }

  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 100;
  const database = await getDb();

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
    [sanitized, safeLimit]
  );
}

/** Get a single book by ID */
export async function getBookById(bookId: number): Promise<Book | null> {
  if (!Number.isInteger(bookId) || bookId < 1) {
    return null;
  }
  const database = await getDb();
  const results = await database.select<Book[]>(
    'SELECT id, name, name_id, name_sml, abbr, testament, total_chapters, order_num FROM books WHERE id = $1 LIMIT $2',
    [bookId, 1]
  );
  return results.length > 0 ? results[0] : null;
}
