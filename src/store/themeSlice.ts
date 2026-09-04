// src/store/themeSlice.ts

import { StateCreator } from "zustand";

export type ThemeSlice = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

// Theme slice creation
export const createThemeSlice: StateCreator<ThemeSlice> = (set) => ({
  theme: "light",
  setTheme: (theme: "light" | "dark") => set({ theme }),
});
