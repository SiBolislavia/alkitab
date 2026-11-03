use std::fs;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db_name = "alkitab.db";

            // In tauri-plugin-sql v2, SQLite resolves relative to app_config_dir()
            // (on Windows: %APPDATA%\com.alkitab.desktop)
            let config_dir = app
                .path()
                .app_config_dir()
                .expect("failed to get app config dir");

            let local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("failed to get app local data dir");

            // Try resolving from Tauri resources first (production)
            let resource_path = app
                .path()
                .resolve(db_name, tauri::path::BaseDirectory::Resource);

            let source = match resource_path {
                Ok(p) if p.exists() => p,
                _ => {
                    // Dev mode fallbacks
                    let dev_path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                        .join("resources")
                        .join(db_name);
                    if dev_path.exists() {
                        dev_path
                    } else {
                        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                            .parent()
                            .unwrap_or(std::path::Path::new("."))
                            .join(db_name)
                    }
                }
            };

            // Copy to both config_dir and local_data_dir to ensure compatibility
            for target_dir in [&config_dir, &local_data_dir] {
                let target_path = target_dir.join(db_name);

                let should_copy = if target_path.exists() {
                    match (fs::metadata(&target_path), fs::metadata(&source)) {
                        (Ok(t_meta), Ok(s_meta)) => t_meta.len() != s_meta.len() || t_meta.len() < 1_000_000,
                        _ => true,
                    }
                } else {
                    true
                };

                if should_copy {
                    let _ = fs::create_dir_all(target_dir);

                    if source.exists() {
                        if let Err(e) = fs::copy(&source, &target_path) {
                            eprintln!("Failed to copy DB to {:?}: {}", target_path, e);
                        } else {
                            println!("Copied Alkitab DB to {:?}", target_path);
                        }
                    } else {
                        eprintln!("Database source not found at {:?}", source);
                    }
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
