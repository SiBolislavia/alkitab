# Security Policy

## 1. Reporting Vulnerabilities
Jika Anda menemukan kerentanan keamanan pada aplikasi ini, harap laporkan langsung melalui fitur **Hubungi Saya** di dalam aplikasi.

## 2. Tauri Security Model & IPC
- **Content Security Policy (CSP):** Dikonfigurasi ketat di `tauri.conf.json` untuk mencegah eksekusi skrip berbahaya eksternal.
- **Isolated Context & Separation of Concerns:** Seluruh akses database dipisahkan sepenuhnya dari komponen UI ke dalam service layer (`src/services/dbService.ts`) melalui IPC resmi Tauri.
- **SQLCipher Database Encryption:** File database (`src-tauri/resources/alkitab.db`) dienkripsi penuh menggunakan **SQLCipher** (AES-256-CBC + HMAC-SHA512), dan kunci dekripsi dikelola secara internal di backend Rust tanpa pernah diekspos ke lapisan frontend.
- **Anti-SQL Injection & Read-Only Enforcement:**
  - Seluruh query SQL wajib menggunakan *parameterized queries* (`$1, $2`) serta validasi dan sanitasi input ketat.
  - Koneksi database dibuka dalam mode *read-only* (`read_only(true)`) dan kapabilitas IPC dibatasi hanya untuk operasi pembacaan (`sql:allow-select`), sehingga operasi modifikasi (`INSERT`, `UPDATE`, `DELETE`, `DROP`) ditolak secara permanen.
