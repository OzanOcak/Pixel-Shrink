// src/pages/homepage.tsx
import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Play, X, FolderOpen } from "lucide-react";
import ImageCard from "@/components/ui/imageCard";
import pixelShrinkIcon from "@/assets/pixel_shrink.webp";

const HomePage: React.FC = () => {
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    isProcessing,
    progress,
    quality,
    outputFormat,
    lastUploadDir,
    lastSaveDir,
    setQuality,
    setOutputFormat,
    setProcessing,
    setProgress,
    updateFileStatus,
    updateFileResult,
    setLastUploadDir,
    setLastSaveDir,
  } = useAppStore();

  const [lastOutputPath, setLastOutputPath] = React.useState<string>("");

  useEffect(() => {
    // Reset processing state when app loads
    setProcessing(false);
    setProgress(0);
  }, []);

  // Process files from paths
  const processFiles = async (paths: string[]) => {
    console.log("📁 Processing files:", paths);
    const imageFiles = [];
    for (const path of paths) {
      try {
        const info = await invoke<{
          path: string;
          name: string;
          size: number;
          format: string;
          width: number;
          height: number;
        }>("get_image_info", { path });
        imageFiles.push({ ...info, path });
      } catch (error) {
        console.error("Failed to get image info:", error);
      }
    }
    if (imageFiles.length > 0) {
      addFiles(imageFiles);
    }
  };

  const handleUpload = async () => {
    try {
      const selected = await open({
        multiple: true,
        defaultPath: lastUploadDir || undefined,
        filters: [
          {
            name: "Images",
            extensions: ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif"],
          },
        ],
      });

      if (
        !selected ||
        typeof selected === "string" ||
        !Array.isArray(selected)
      ) {
        return;
      }

      // Save the directory from the first file
      if (selected.length > 0) {
        const dir = selected[0].substring(0, selected[0].lastIndexOf("/"));
        setLastUploadDir(dir);
      }

      await processFiles(selected);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleCompress = async () => {
    console.log("🔵 Compress started");
    console.log("🔵 Files:", files);

    if (files.length === 0 || isProcessing) return;

    let defaultPath = `${files[0].name.replace(/\.[^.]+$/, "")}_compressed.${outputFormat}`;
    if (lastSaveDir) {
      defaultPath = `${lastSaveDir}/${defaultPath}`;
    }

    const filePath = await save({
      defaultPath: defaultPath,
      filters: [
        {
          name: "Image",
          extensions: [outputFormat],
        },
      ],
    });

    console.log("🔵 Save path selected:", filePath);

    if (!filePath || typeof filePath !== "string") {
      console.log("❌ No save path selected");
      return;
    }

    // ✅ Get the directory from the selected path
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    if (dir) {
      setLastSaveDir(dir);
      setLastOutputPath(dir);
    }

    setProcessing(true);
    setProgress(0);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const total = files.length;
    let completed = 0;

    for (const file of files) {
      console.log(`🔵 Processing file: ${file.name}`);
      console.log(`🔵 Input path: ${file.path}`);

      updateFileStatus(file.id, "processing");

      // ✅ Generate UNIQUE path for each file
      const fileName = file.name.replace(/\.[^.]+$/, "");
      const outputPath = `${dir}/${fileName}_compressed.${outputFormat}`;

      try {
        const result = await invoke<string>("compress_image", {
          inputPath: file.path,
          outputPath,
          quality,
          outputFormat,
        });

        console.log(`✅ Compression result:`, result);

        const match = result.match(
          /(\d+) → (\d+) bytes \(([\d.]+)% of original\)/,
        );
        let realOutputSize: number;

        if (match) {
          realOutputSize = parseInt(match[2]);
          updateFileResult(file.id, realOutputSize, outputPath);
        } else {
          const estimatedSize = Math.round(file.size * (quality / 100));
          updateFileResult(file.id, estimatedSize, outputPath);
        }

        completed++;
        setProgress((completed / total) * 100);
      } catch (error) {
        console.error(`❌ Compression failed for ${file.name}:`, error);
        updateFileStatus(file.id, "error");
        completed++;
        setProgress((completed / total) * 100);
      }
    }

    setProcessing(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="flex flex-col max-w-[96%] mx-auto dark:text-white flex-shrink-0 h-full">
      {/* At the very top of your component, before everything else */}
      {isProcessing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md py-2 px-4">
          <div className="max-w-[96%] mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Compressing...</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-100 flex-shrink-0"></h1>

      {/* Upload Area - No dashed border */}
      <div className="text-center rounded-lg pb-4 mb-4 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 mb-0">
          <img
            src={pixelShrinkIcon}
            alt="Pixel Shrink"
            className="h-32 w-32 rounded-2xl shadow-lg mb-4"
          />
          <div>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Pixel Shrink
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Image Optimizer
            </p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Click the button below to select images
        </p>
        <Button onClick={handleUpload} disabled={isProcessing}>
          <Upload className="mr-2 h-4 w-4" />
          Choose Images
        </Button>
        {files.length > 0 && (
          <Button
            variant="destructive"
            onClick={clearFiles}
            disabled={isProcessing}
            className="ml-2"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All ({files.length})
          </Button>
        )}
      </div>

      {/* Image Grid */}

      <ScrollArea className="p-4 flex-1 min-h-0">
        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-2">
            {files.map((file) => (
              <ImageCard
                key={file.id}
                file={file}
                onRemove={removeFile}
                isProcessing={isProcessing}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Controls */}

      <div className="my-4 pt-4 border-t dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium">Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="text-sm font-medium block">Output Format</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600"
              disabled={isProcessing}
            >
              <option value="webp">WebP</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Files:</span>
            <span className="font-bold">{files.length}</span>
          </div>
          {/* Open Folder Button */}
          <Button
            variant="outline"
            onClick={() => invoke("open_folder", { path: lastOutputPath })}
            className="w-[40px]"
            disabled={isProcessing}
          >
            <FolderOpen className="mr-0 h-4 w-4" />
          </Button>
          <Button
            onClick={handleCompress}
            disabled={isProcessing || files.length === 0}
            className="ml-auto w-[180px]"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Compressing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Compress All
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
