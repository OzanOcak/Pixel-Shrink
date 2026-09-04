// src-tauri/src/lib.rs
mod commands;
mod models;  
mod services;
mod utils;
mod error;


use commands::image::{compress_image, get_image_info};
use commands::batch::batch_process;
use commands::settings::{load_settings, save_settings};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init()) 
        .invoke_handler(tauri::generate_handler![
            compress_image,
            get_image_info,
            batch_process,
            load_settings,
            save_settings,
            open_folder, 
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_folder(path: String) {
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(path).spawn();
    }
}