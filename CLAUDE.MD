# CLAUDE.md - AI Assistant Guidelines

## Project Context
- **Name:** Offline Bible Desktop
- **Type:** Desktop Application (Offline-First)
- **Stack:** Tauri v2, Next.js (Static Export), SQLite, Tailwind CSS.
- **Package Manager:** `npm` (DO NOT use yarn or pnpm commands).

## Commands Reference
- `npm run dev` : Menjalankan Next.js dev server standalone (untuk debugging UI).
- `npm run build` : Build static export Next.js (`out/`).
- `npm run tauri dev` : Menjalankan aplikasi Tauri secara lokal dengan hot-reload.
- `npm run tauri build` : Membuat installer production siap rilis.

## Code Conventions
- Gunakan TypeScript untuk seluruh file logika dan komponen React.
- Komponen UI menggunakan Tailwind CSS dengan pendekatan *mobile-first / desktop-optimized*.
- Akses database SQLite wajib melalui Tauri IPC (`tauri-plugin-sql`) dengan penanganan error yang aman di sisi klien.