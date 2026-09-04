// src-tauri/src/models/image.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageInfo {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub format: String,
    pub width: u32,
    pub height: u32,
    pub is_animated: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessedImage {
    pub input_path: String,
    pub output_path: String,
    pub original_size: u64,
    pub compressed_size: u64,
    pub compression_ratio: f64,
    pub format: String,
    pub status: ProcessStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum ProcessStatus {
    Success,
    Failed(String),
    Skipped,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BatchResult {
    pub total: usize,
    pub processed: usize,
    pub failed: usize,
    pub results: Vec<ProcessedImage>,
    pub total_original_size: u64,
    pub total_compressed_size: u64,
}