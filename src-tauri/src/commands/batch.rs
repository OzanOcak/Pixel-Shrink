// src-tauri/src/commands/batch.rs
use std::fs;
use std::path::Path;
use walkdir::WalkDir;
use crate::models::image::{ProcessedImage, ProcessStatus, BatchResult};
use crate::commands::image::compress_image;
use crate::error::AppError;

#[tauri::command]
pub async fn batch_process(
    input_dir: String,
    output_dir: String,
    quality: u8,
    output_format: String,
) -> Result<BatchResult, AppError> {
    let input_dir = Path::new(&input_dir);
    let output_dir = Path::new(&output_dir);
    
    if !input_dir.exists() {
        return Err(AppError::FileNotFound(input_dir.to_string_lossy().to_string()));
    }
    
    fs::create_dir_all(output_dir)
        .map_err(|e| AppError::IoError(e.to_string()))?;
    
    let mut results = Vec::new();
    let mut total_original_size = 0;
    let mut total_compressed_size = 0;
    let mut processed_count = 0;
    let mut failed_count = 0;
    let mut total_count = 0;
    
    let supported_extensions = ["jpg", "jpeg", "png", "bmp", "tiff", "webp", "gif"];
    
    for entry in WalkDir::new(input_dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
    {
        let path = entry.path();
        let ext = path.extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        
        if !supported_extensions.contains(&ext.as_str()) {
            continue;
        }
        
        total_count += 1;
        let original_size = fs::metadata(path)
            .map(|m| m.len())
            .unwrap_or(0);
        total_original_size += original_size;
        
        let output_file = output_dir.join(
            path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("image")
                .to_string()
                + "."
                + &output_format.to_lowercase()
        );
        
        // Process the image - REMOVE .await
        match compress_image(
            path.to_string_lossy().to_string(),
            output_file.to_string_lossy().to_string(),
            quality,
            output_format.clone(),
        ) {  // ← REMOVED .await
            Ok(_msg) => {
                let compressed_size = fs::metadata(&output_file)
                    .map(|m| m.len())
                    .unwrap_or(0);
                total_compressed_size += compressed_size;
                processed_count += 1;
                
                results.push(ProcessedImage {
                    input_path: path.to_string_lossy().to_string(),
                    output_path: output_file.to_string_lossy().to_string(),
                    original_size,
                    compressed_size,
                    compression_ratio: if original_size > 0 {
                        (compressed_size as f64 / original_size as f64) * 100.0
                    } else {
                        0.0
                    },
                    format: output_format.clone(),
                    status: ProcessStatus::Success,
                });
            }
            Err(e) => {
                failed_count += 1;
                results.push(ProcessedImage {
                    input_path: path.to_string_lossy().to_string(),
                    output_path: output_file.to_string_lossy().to_string(),
                    original_size,
                    compressed_size: 0,
                    compression_ratio: 0.0,
                    format: output_format.clone(),
                    status: ProcessStatus::Failed(e.to_string()),
                });
            }
        }
    }
    
    Ok(BatchResult {
        total: total_count,
        processed: processed_count,
        failed: failed_count,
        results,
        total_original_size,
        total_compressed_size,
    })
}