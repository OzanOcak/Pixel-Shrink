// src/store/useAppStore.ts
import { create } from "zustand";
import { load, Store } from "@tauri-apps/plugin-store";
import { immer } from "zustand/middleware/immer";
import {
  subscribeWithSelector,
  persist,
  PersistStorage,
  StorageValue,
} from "zustand/middleware";
import { createThemeSlice, ThemeSlice } from "./themeSlice";
import { createImageSlice, ImageSlice } from "./imageSlice";

type AppStore = ThemeSlice & ImageSlice;

const STORAGE_FILE = "zustand-store.json";

let initializedStore: Store | null = null;

const initializeStore = async (): Promise<Store> => {
  if (initializedStore) {
    return initializedStore;
  }
  initializedStore = await load(STORAGE_FILE);
  return initializedStore;
};

export const customStorage: PersistStorage<AppStore> = {
  getItem: async (key: string): Promise<StorageValue<AppStore> | null> => {
    try {
      const store = await initializeStore();
      const value: string | null | undefined = await store.get(key);
      return value ? (JSON.parse(value) as StorageValue<AppStore>) : null;
    } catch (error) {
      console.error("Error getItem:", error);
      return null;
    }
  },
  setItem: async (key: string, value: StorageValue<AppStore> | null) => {
    try {
      const store = await initializeStore();
      await store.set(key, value ? JSON.stringify(value) : null);
      await store.save();
    } catch (error) {
      console.error("Error setItem:", error);
    }
  },
  removeItem: async (key: string) => {
    try {
      const store = await initializeStore();
      await store.delete(key);
      await store.save();
    } catch (error) {
      console.error("Error removeItem:", error);
    }
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    subscribeWithSelector(
      immer((set, get, api) => {
        // Cast set to any to avoid type conflicts with immer
        const setAny = set as any;
        const apiAny = api as any;

        return {
          ...createThemeSlice(setAny, get, apiAny),
          ...createImageSlice(setAny),
        };
      }),
    ),
    {
      name: "state",
      storage: customStorage,
    },
  ),
);

const loadStore = async () => {
  try {
    const store = await initializeStore();
    const val = await store.get("state");

    if (val) {
      useAppStore.setState(val);
    } else {
      console.log("No stored state found, using default state.");
    }
  } catch (error) {
    console.error("Failed to load store:", error);
  }
};

export { loadStore };
export default useAppStore;
