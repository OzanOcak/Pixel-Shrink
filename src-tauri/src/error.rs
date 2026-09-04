// src-tauri/src/error.rs
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    Generic(String),
    #[error("File not found: {0}")]
    FileNotFound(String),
    #[error("IO error: {0}")]
    IoError(String),
    #[error("Image error: {0}")]
    ImageError(String),
    #[error("Unsupported format: {0}")]
    InvalidFormat(String),
    #[error("Store error: {0}")]
    StoreError(String),          // ← ADD THIS
    #[error("Serialization error: {0}")]
    SerializationError(String),  // ← ADD THIS
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}