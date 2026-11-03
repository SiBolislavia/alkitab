# Development Taskboard & Roadmap

## Phase 1: Inisialisasi & Setup Proyek
- [ ] Inisialisasi proyek Next.js dengan App Router dan konfigurasi `output: 'export'`.
- [ ] Inisialisasi Tauri v2 pada direktori proyek dan konfigurasi `tauri.conf.json`.
- [ ] Menyiapkan struktur folder dasar (`src/components`, `src/services`, `src-tauri/resources`).

## Phase 2: Integrasi Database SQLite
- [ ] Menempatkan file `alkitab.db` pada folder resource Tauri.
- [ ] Menginstal dan mengonfigurasi `tauri-plugin-sql`.
- [ ] Membuat helper service TypeScript untuk koneksi dan query database (mengambil daftar kitab, pasal, dan ayat).

## Phase 3: Pengembangan UI Alkitab (Frontend)
- [ ] Membangun layout utama (Sidebar Navigasi Kitab/Pasal & Area Konten Pembacaan).
- [ ] Implementasi fungsi render ayat Alkitab secara dinamis berdasarkan pilihan user.
- [ ] Menambahkan fitur pengaturan (Font size adjuster dan Dark/Light/Sepia theme).

## Phase 4: Testing & Build Release
- [ ] Melakukan pengujian fungsionalitas offline secara menyeluruh.
- [ ] Build production (`npm run tauri build`) dan verifikasi installer di sistem operasi target.