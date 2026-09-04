// src/hooks/useImageProcessing.ts
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "@/store/useAppStore";

export function useImageProcessing() {
  const {
    files,
    addFiles,
    updateFileStatus,
    updateFileResult,
    setProcessing,
    setProgress,
    isProcessing,
    progress,
    quality,
    outputFormat,
  } = useAppStore();

  // Process files from drag-drop or file input
  const processFileList = async (fileList: FileList) => {
    console.log("Processing file list:", fileList);
    const imageFiles = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      console.log("Processing file:", file.name);

      try {
        // For HTML5 File API, we need to get the path differently
        // In Tauri, we can use the file path if available
        const path = (file as any).path || file.name;

        // Try to get image info
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
          console.error("Failed to get image info for:", file.name, error);
          // Fallback: use file info
          imageFiles.push({
            path: path,
            name: file.name,
            size: file.size,
            format: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
            width: 0,
            height: 0,
          });
        }
      } catch (error) {
        console.error("Error processing file:", file.name, error);
      }
    }

    if (imageFiles.length > 0) {
      addFiles(imageFiles);
      console.log("Added", imageFiles.length, "files");
    }
    return imageFiles;
  };

  // Process files from dialog (already has paths)
  const processPaths = async (paths: string[]) => {
    console.log("Processing paths:", paths);
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
        console.error("Failed to get image info for:", path, error);
      }
    }

    if (imageFiles.length > 0) {
      addFiles(imageFiles);
      console.log("Added", imageFiles.length, "files");
    }
    return imageFiles;
  };

  // Compress all images
  const compressAll = async () => {
    if (files.length === 0 || isProcessing) return;

    const outputDir = await open({
      directory: true,
      multiple: false,
    });

    if (
      !outputDir ||
      typeof outputDir === "string" ||
      Array.isArray(outputDir)
    ) {
      return;
    }

    setProcessing(true);
    setProgress(0);

    const total = files.length;
    let completed = 0;

    for (const file of files) {
      if (file.status === "done" || file.status === "error") {
        completed++;
        setProgress((completed / total) * 100);
        continue;
      }

      updateFileStatus(file.id, "processing");

      const fileName = file.name.replace(/\.[^.]+$/, "");
      const outputPath = `${outputDir}/${fileName}.${outputFormat}`;

      try {
        await invoke("compress_image", {
          inputPath: file.path,
          outputPath,
          quality,
          outputFormat,
        });

        const estimatedSize = Math.round(file.size * (quality / 100));
        updateFileResult(file.id, estimatedSize, outputPath);

        completed++;
        setProgress((completed / total) * 100);
      } catch (error) {
        console.error("Compression failed for:", file.name, error);
        updateFileStatus(file.id, "error");
        completed++;
        setProgress((completed / total) * 100);
      }
    }

    setProcessing(false);
  };

  return {
    processFileList,
    processPaths,
    compressAll,
    isProcessing,
    progress,
    quality,
    outputFormat,
    setQuality: useAppStore.getState().setQuality,
    setOutputFormat: useAppStore.getState().setOutputFormat,
  };
}
