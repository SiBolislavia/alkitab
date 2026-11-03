# Code Style & UI Styleguide

## 1. TypeScript & React Conventions
- Gunakan **Functional Components** dengan arrow functions atau function declarations standar.
- Berikan tipe data (interface/type) yang jelas untuk setiap props komponen dan hasil query database.
- Hindari penggunaan `any`. Gunakan `unknown` atau tipe spesifik.

## 2. Styling (Tailwind CSS)
- Gunakan utilitas bawaan Tailwind CSS.
- Terapkan variabel warna untuk mendukung mode gelap (Dark Mode) secara mulus.
- Contoh struktur kelas komponen interaktif: `transition-colors duration-200 ease-in-out`.

## 3. File & Folder Naming
- Komponen React: PascalCase (contoh: `BibleReader.tsx`, `SidebarNav.tsx`).
- Utility/Helper files: camelCase (contoh: `dbService.ts`, `formatHelper.ts`).
- Direktori: kebab-case atau camelCase standar Next.js app router.