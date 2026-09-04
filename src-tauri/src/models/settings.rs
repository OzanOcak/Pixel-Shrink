// src-tauri/src/models/settings.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub compression: CompressionSettings,
    pub output: OutputSettings,
    pub ui: UiSettings,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CompressionSettings {
    pub quality: u8,              // 1-100
    pub preserve_metadata: bool,
    pub optimize_for_web: bool,
    pub remove_alpha: bool,       // For PNG -> JPEG
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OutputSettings {
    pub format: OutputFormat,
    pub output_directory: String,
    pub naming_pattern: NamingPattern,
    pub overwrite: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OutputFormat {
    Jpeg,
    Png,
    WebP,
    Avif,
    Original,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum NamingPattern {
    Original,
    Suffix(String),
    Prefix(String),
    Timestamp,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UiSettings {
    pub theme: Theme,
    pub show_preview: bool,
    pub show_progress: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Theme {
    Light,
    Dark,
    System,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            compression: CompressionSettings {
                quality: 80,
                preserve_metadata: false,
                optimize_for_web: true,
                remove_alpha: false,
            },
            output: OutputSettings {
                format: OutputFormat::WebP,
                output_directory: "".to_string(),
                naming_pattern: NamingPattern::Suffix("_compressed".to_string()),
                overwrite: false,
            },
            ui: UiSettings {
                theme: Theme::System,
                show_preview: true,
                show_progress: true,
            },
        }
    }
}