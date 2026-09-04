// src/components/ui/imageCard.tsx
import React from "react";
import { X, Image as ImageIcon } from "lucide-react";

interface ImageFile {
  id: string;
  path: string;
  name: string;
  size: number;
  format: string;
  width: number;
  height: number;
  status: "idle" | "processing" | "done" | "error";
  compressedSize?: number;
  compressionRatio?: number;
  outputPath?: string;
}

interface ImageCardProps {
  file: ImageFile;
  onRemove: (id: string) => void;
  isProcessing: boolean;
  formatFileSize: (bytes: number) => string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  file,
  onRemove,
  isProcessing,
  formatFileSize,
}) => {
  return (
    <div className="relative p-2 w-[158px] h-[158px] border rounded-lg hover:shadow-lg transition-shadow dark:border-gray-700">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute z-10 top-0 right-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        disabled={isProcessing}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-1 flex flex-col items-center justify-center relative">
        {/* Icon + Filename - centered */}
        <div className="flex flex-col items-center justify-center flex-1">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <div className="w-full min-w-0 overflow-hidden">
            <p className="font-medium text-sm truncate overflow-hidden">
              {file.name.length > 10
                ? file.name.slice(0, 9) + "..."
                : file.name}{" "}
            </p>
          </div>
        </div>

        {/* File info - at the bottom */}
        <div className="w-full px-2 pb-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span>
              {file.width}×{file.height}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-600">
              {file.format}
            </span>
            {file.status === "processing" && (
              <span className="text-xs text-blue-500">⏳ Processing...</span>
            )}
            {file.status === "done" && file.compressedSize && (
              <span className="text-xs text-green-500">
                ✓ {formatFileSize(file.compressedSize)}
                <span className="block text-[10px]">
                  ({((1 - file.compressedSize / file.size) * 100).toFixed(0)}%
                  smaller)
                </span>
              </span>
            )}
            {file.status === "error" && (
              <span className="text-xs text-red-500">❌ Error</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
