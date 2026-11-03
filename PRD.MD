# Product Requirements Document (PRD): Offline Bible Desktop

## 1. Overview & Objectives
Aplikasi desktop lintas platform (Windows, macOS, Linux) yang memungkinkan pengguna membaca Alkitab secara offline tanpa memerlukan koneksi internet, dengan performa tinggi dan antarmuka yang bersih serta ramah mata.

## 2. Target Audience
- Pengguna umum yang membutuhkan akses Alkitab cepat di komputer/laptop.
- Jemaat gereja, pengajar, dan teolog yang memerlukan fitur pencarian teks ayat cepat dan offline.

## 3. Core Features
- **Navigasi Kitab & Pasal:** Pemilih Kitab (Perjanjian Lama & Baru) dan Pasal interaktif.
- **Tampilan Pembacaan (Reader View):** Teks ayat tersusun rapi dengan ukuran font yang dapat diubah (Zoom in/out).
- **Pencarian Cepat (Instant Search):** Mencari kata atau frasa tertentu di seluruh isi Alkitab secara lokal dan instan.
- **Mode Tampilan (Themes):** Light Mode, Dark Mode, dan Sepia Mode untuk kenyamanan membaca di malam hari.
- **Bookmark & Catatan (Opsional/Tahap Lanjut):** Menyimpan ayat favorit ke database lokal.

## 4. Non-Functional Requirements
- **Offline-First:** Seluruh data teks Alkitab bersumber dari file SQLite lokal (`alkitab.db`).
- **Performance:** Waktu *startup* aplikasi < 2 detik.
- **Cross-Platform:** Kompatibel dengan Windows 10/11, macOS, dan Linux.