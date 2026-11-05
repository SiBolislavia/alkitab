use std::fs;
use std::io::Read;
use std::path::Path;
use tauri::Manager;

const DB_NAME: &str = "alkitab.db";
const DB_CONN_KEY: &str = "sqlite:alkitab.db";
const DB_CIPHER_KEY: &str = "'Alkitab_Delwinro_Simalungun_SQLCipher_2026!#98a7b6c5d4e3f2'";

fn files_differ(source: &Path, target: &Path) -> bool {
    let (Ok(s_meta), Ok(t_meta)) = (fs::metadata(source), fs::metadata(target)) else {
        return true;
    };
    if s_meta.len() != t_meta.len() || t_meta.len() < 1_000_000 {
        return true;
    }
    let (Ok(mut s_file), Ok(mut t_file)) = (fs::File::open(source), fs::File::open(target)) else {
        return true;
    };
    let mut s_buf = [0u8; 64];
    let mut t_buf = [0u8; 64];
    if s_file.read_exact(&mut s_buf).is_err() || t_file.read_exact(&mut t_buf).is_err() {
        return true;
    }
    s_buf != t_buf
}

fn run_async<F: std::future::Future>(fut: F) -> F::Output {
    if tokio::runtime::Handle::try_current().is_ok() {
        tokio::task::block_in_place(|| tokio::runtime::Handle::current().block_on(fut))
    } else {
        tauri::async_runtime::block_on(fut)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let config_dir = app
                .path()
                .app_config_dir()
                .expect("failed to get app config dir");

            let local_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("failed to get app local data dir");

            let resource_path = app
                .path()
                .resolve(DB_NAME, tauri::path::BaseDirectory::Resource)
                .ok()
                .filter(|p| p.exists())
                .or_else(|| {
                    app.path()
                        .resolve(
                            format!("resources/{DB_NAME}"),
                            tauri::path::BaseDirectory::Resource,
                        )
                        .ok()
                        .filter(|p| p.exists())
                });

            let source = match resource_path {
                Some(p) => p,
                None => std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                    .join("resources")
                    .join(DB_NAME),
            };

            for target_dir in [&config_dir, &local_data_dir] {
                let target_path = target_dir.join(DB_NAME);
                if files_differ(&source, &target_path) {
                    let _ = fs::create_dir_all(target_dir);
                    if source.exists() {
                        let _ = fs::remove_file(target_dir.join(format!("{DB_NAME}-wal")));
                        let _ = fs::remove_file(target_dir.join(format!("{DB_NAME}-shm")));
                        let _ = fs::copy(&source, &target_path);
                    }
                }
            }

            let active_db_path = config_dir.join(DB_NAME);
            run_async(async {
                let opts = sqlx::sqlite::SqliteConnectOptions::new()
                    .filename(&active_db_path)
                    .pragma("key", DB_CIPHER_KEY)
                    .read_only(true)
                    .create_if_missing(false);

                let pool = sqlx::sqlite::SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect_with(opts)
                    .await
                    .expect("failed to open encrypted database");

                let instances = app.state::<tauri_plugin_sql::DbInstances>();
                let mut lock = instances.0.write().await;
                lock.insert(
                    DB_CONN_KEY.to_string(),
                    tauri_plugin_sql::DbPool::Sqlite(pool),
                );
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_external_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("mailto:") {
        return Err("Invalid URL scheme".to_string());
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::{ConnectOptions, Row};

    #[tokio::test]
    async fn verify_encrypted_resource_db() {
        let res_path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("resources")
            .join(DB_NAME);
        assert!(res_path.exists(), "Resource DB does not exist at {:?}", res_path);

        // 1. Verify file header is SQLCipher encrypted (not plaintext SQLite)
        let mut header = [0u8; 16];
        {
            let mut f = fs::File::open(&res_path).unwrap();
            f.read_exact(&mut header).unwrap();
            assert_ne!(&header, b"SQLite format 3\0", "DB header should be encrypted");
        }

        // 2. Verify opening WITHOUT key fails to read
        {
            let bad_res = sqlx::sqlite::SqliteConnectOptions::new()
                .filename(&res_path)
                .read_only(true)
                .connect()
                .await;
            if let Ok(mut bad_conn) = bad_res {
                let q = sqlx::query("SELECT count(*) FROM books").fetch_one(&mut bad_conn).await;
                assert!(q.is_err(), "Reading encrypted DB without key must fail");
            }
        }

        // 3. Verify opening WITH SQLCipher key + read_only(true) succeeds
        let opts = sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&res_path)
            .pragma("key", DB_CIPHER_KEY)
            .read_only(true)
            .create_if_missing(false);

        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(2)
            .connect_with(opts)
            .await
            .unwrap();

        let row = sqlx::query("SELECT count(*) FROM books WHERE order_num >= $1")
            .bind(1_i64)
            .fetch_one(&pool)
            .await
            .unwrap();
        let books_count: i64 = row.get(0);
        assert_eq!(books_count, 66);

        let v_row = sqlx::query("SELECT text_sml FROM verses WHERE book_id = $1 AND chapter = $2 AND verse = $3")
            .bind(33_i64)
            .bind(1_i64)
            .bind(12_i64)
            .fetch_one(&pool)
            .await
            .unwrap();
        let micah_1_12: String = v_row.get(0);
        assert!(!micah_1_12.contains("Ams. 3:6"));

        let fts_row = sqlx::query("SELECT count(*) FROM verses_fts WHERE verses_fts MATCH $1")
            .bind("Naibata")
            .fetch_one(&pool)
            .await
            .unwrap();
        let fts_count: i64 = fts_row.get(0);
        assert!(fts_count > 100);

        // 4. Verify write operations are rejected on read-only connection
        let write_attempt = sqlx::query("DELETE FROM books WHERE id = $1")
            .bind(1_i64)
            .execute(&pool)
            .await;
        assert!(write_attempt.is_err(), "Write on read-only pool must fail");
    }
}
