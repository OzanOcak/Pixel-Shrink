// src/store/imageStore.ts

export interface ImageFile {
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

export interface ImageSlice {
  files: ImageFile[];
  isProcessing: boolean;
  progress: number;
  quality: number;
  outputFormat: string;
  lastUploadDir: string;
  lastSaveDir: string;
  addFiles: (files: Omit<ImageFile, "id" | "status">[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileStatus: (id: string, status: ImageFile["status"]) => void;
  updateFileResult: (
    id: string,
    compressedSize: number,
    outputPath: string,
  ) => void;
  setQuality: (quality: number) => void;
  setOutputFormat: (format: string) => void;
  setLastUploadDir: (dir: string) => void;
  setLastSaveDir: (dir: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
}

export const createImageSlice = (set: any): ImageSlice => ({
  files: [],
  isProcessing: false,
  progress: 0,
  quality: 80,
  outputFormat: "webp",
  lastUploadDir: "",
  lastSaveDir: "",

  addFiles: (newFiles) => {
    set((state: any) => {
      state.files = [
        ...state.files,
        ...newFiles.map((file: any) => ({
          ...file,
          id: crypto.randomUUID(),
          status: "idle",
        })),
      ];
    });
  },

  removeFile: (id: string) =>
    set((state: any) => {
      state.files = state.files.filter((f: ImageFile) => f.id !== id);
    }),

  clearFiles: () =>
    set((state: any) => {
      state.files = [];
    }),

  updateFileStatus: (id: string, status: ImageFile["status"]) =>
    set((state: any) => {
      const file = state.files.find((f: ImageFile) => f.id === id);
      if (file) file.status = status;
    }),

  updateFileResult: (id: string, compressedSize: number, outputPath: string) =>
    set((state: any) => {
      const file = state.files.find((f: ImageFile) => f.id === id);
      if (file) {
        file.status = "done";
        file.compressedSize = compressedSize;
        file.outputPath = outputPath;
        file.compressionRatio = (compressedSize / file.size) * 100;
      }
    }),

  setQuality: (quality: number) =>
    set((state: any) => {
      state.quality = quality;
    }),

  setOutputFormat: (format: string) =>
    set((state: any) => {
      state.outputFormat = format;
    }),

  setLastUploadDir: (dir: string) =>
    set((state: any) => {
      state.lastUploadDir = dir;
    }),

  setLastSaveDir: (dir: string) =>
    set((state: any) => {
      state.lastSaveDir = dir;
    }),
  setProcessing: (isProcessing: boolean) =>
    set((state: any) => {
      state.isProcessing = isProcessing;
    }),

  setProgress: (progress: number) =>
    set((state: any) => {
      state.progress = progress;
    }),
});
