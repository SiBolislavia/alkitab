# Security Policy

## 1. Reporting Vulnerabilities
Jika Anda menemukan kerentanan keamanan pada aplikasi ini, harap laporkan langsung melalui maintainer proyek.

## 2. Tauri Security Model & IPC
- **Content Security Policy (CSP):** Dikonfigurasi ketat di `tauri.conf.json` untuk mencegah eksekusi skrip berbahaya eksternal.
- **Isolated Context:** Frontend Next.js berjalan dalam webview lokal yang terisolasi; komunikasi dengan sistem operasi (seperti pembacaan file SQLite) hanya diizinkan melalui plugin resmi Tauri (`tauri-plugin-sql`).
- **Database Integrity:** File database SQLite (`alkitab.db`) disimpan dalam direktori resource aplikasi yang aman dan hanya dibaca secara *read-only* oleh aplikasi untuk mencegah modifikasi data yang tidak sah.