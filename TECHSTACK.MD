# Tech Stack Specifications

| Layer | Technology | Version / Details | Purpose |
| :--- | :--- | :--- | :--- |
| **Desktop Core** | Tauri | v2.x (Rust) | Native wrapper yang ringan dan aman untuk aplikasi web. |
| **Frontend Framework** | Next.js | v15+ (App Router) | Framework React dengan dukungan Static Export (`output: 'export'`). |
| **Language** | TypeScript | v5.x | Menjamin keamanan tipe data (*type-safety*) pada frontend dan logika aplikasi. |
| **Styling** | Tailwind CSS | v3.x / v4.x | Utility-first CSS framework untuk desain UI modern dan cepat. |
| **Database** | SQLite | v3.x | Database relasional lokal yang ringan, cepat, dan di-embed langsung ke aplikasi. |
| **DB Plugin** | tauri-plugin-sql | Latest Tauri v2 compatible | Plugin resmi Tauri untuk menghubungkan frontend ke database SQLite lokal. |
| **Package Manager** | npm | Default Node.js | Pengelola paket dependensi proyek. |