use std::fs;
use std::path::Path;
use image::{ImageFormat, GenericImageView};
use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub format: String,
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
pub fn get_image_info(path: String) -> Result<ImageInfo, AppError> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err(AppError::FileNotFound(path.to_string_lossy().to_string()));
    }
    let metadata = fs::metadata(path).map_err(|e| AppError::IoError(e.to_string()))?;
    let img = image::open(path).map_err(|e| AppError::ImageError(e.to_string()))?;
    let (width, height) = img.dimensions();
    
    Ok(ImageInfo {
        path: path.to_string_lossy().to_string(),
        name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
        size: metadata.len(),
        format: path.extension().unwrap_or_default().to_string_lossy().to_string().to_uppercase(),
        width,
        height,
    })
}

#[tauri::command]
pub fn compress_image(
    input_path: String,
    output_path: String,
    quality: u8,
    output_format: String,
) -> Result<String, AppError> {
    let input_path = Path::new(&input_path);
    let output_path = Path::new(&output_path);
    
    if !input_path.exists() {
        return Err(AppError::FileNotFound(input_path.to_string_lossy().to_string()));
    }
    
    if let Some(parent) = output_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| AppError::IoError(e.to_string()))?;
        }
    }
    
    let original_size = fs::metadata(input_path).map(|m| m.len()).unwrap_or(0);
    let output_format_lower = output_format.to_lowercase();
    
    match output_format_lower.as_str() {
        "png" => {
            if quality >= 90 {
                // Lossless: oxipng
                eprintln!("📸 PNG: Lossless mode");
                let input_data = fs::read(input_path)
                    .map_err(|e| AppError::IoError(e.to_string()))?;
                let options = oxipng::Options::default();
                let output_data = oxipng::optimize_from_memory(&input_data, &options)
                    .map_err(|e| AppError::ImageError(e.to_string()))?;
                fs::write(output_path, output_data)
                    .map_err(|e| AppError::IoError(e.to_string()))?;
            } else {
                // Lossy: Convert to WebP (much smaller!)
                eprintln!("📸 PNG: Converting to WebP for smaller size");
                let img = image::open(input_path)
                    .map_err(|e| AppError::ImageError(e.to_string()))?;
                
                let quality_f32 = quality as f32;
                let encoder = webp::Encoder::from_image(&img)
                    .map_err(|e| AppError::ImageError(format!("Failed to create WebP encoder: {}", e)))?;
                let webp_data = encoder.encode(quality_f32);
                
                // Save as WebP but with .png extension (still WebP format)
                fs::write(output_path, &*webp_data)
                    .map_err(|e| AppError::IoError(e.to_string()))?;
            }
        }
        "jpg" | "jpeg" => {
            let img = image::open(input_path)
                .map_err(|e| AppError::ImageError(e.to_string()))?;
            let mut file = fs::File::create(output_path)
                .map_err(|e| AppError::IoError(e.to_string()))?;
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut file, quality);
            encoder.encode_image(&img)
                .map_err(|e| AppError::ImageError(e.to_string()))?;
        }
        "webp" => {
            let img = image::open(input_path)
                .map_err(|e| AppError::ImageError(e.to_string()))?;
            
            let quality_f32 = quality as f32;
            let encoder = webp::Encoder::from_image(&img)
                .map_err(|e| AppError::ImageError(format!("Failed to create WebP encoder: {}", e)))?;
            let webp_data = encoder.encode(quality_f32);
            
            fs::write(output_path, &*webp_data)
                .map_err(|e| AppError::IoError(e.to_string()))?;
        }
        _ => return Err(AppError::InvalidFormat(output_format)),
    }
    
    let output_size = fs::metadata(output_path).map(|m| m.len()).unwrap_or(0);
    let ratio = (output_size as f64 / original_size as f64) * 100.0;
    
    Ok(format!(
        "{} → {} bytes ({:.1}% of original)",
        original_size, output_size, ratio
    ))
}