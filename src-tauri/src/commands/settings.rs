// src-tauri/src/commands/settings.rs
use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;
use crate::models::settings::AppSettings;
use crate::error::AppError;

#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<AppSettings, AppError> {  // ← REMOVED async
    let app_dir = app.path().app_data_dir()
        .map_err(|e| AppError::IoError(e.to_string()))?;
    
    std::fs::create_dir_all(&app_dir)
        .map_err(|e| AppError::IoError(e.to_string()))?;
    
    let store_path = app_dir.join("settings.json");
    
    let store = StoreBuilder::new(&app, store_path)
        .build()
        .map_err(|e| AppError::StoreError(e.to_string()))?;
    
    if let Some(settings_json) = store.get("settings") {
        let settings: AppSettings = serde_json::from_value(settings_json)
            .map_err(|e| AppError::SerializationError(e.to_string()))?;
        Ok(settings)
    } else {
        Ok(AppSettings::default())
    }
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), AppError> {  // ← REMOVED async
    let app_dir = app.path().app_data_dir()
        .map_err(|e| AppError::IoError(e.to_string()))?;
    
    std::fs::create_dir_all(&app_dir)
        .map_err(|e| AppError::IoError(e.to_string()))?;
    
    let store_path = app_dir.join("settings.json");
    
    let store = StoreBuilder::new(&app, store_path)
        .build()
        .map_err(|e| AppError::StoreError(e.to_string()))?;
    
    let settings_json = serde_json::to_value(settings)
        .map_err(|e| AppError::SerializationError(e.to_string()))?;
    
    store.set("settings", settings_json);
    store.save()
        .map_err(|e| AppError::StoreError(e.to_string()))?;
    
    Ok(())
}