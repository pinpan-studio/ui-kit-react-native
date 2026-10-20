import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PALETTE_ORDER, type PaletteId } from '../theme/generated/palettes';

export type ModePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  paletteId: PaletteId;
  mode: ModePreference;
  setPalette: (id: PaletteId) => void;
  setMode: (mode: ModePreference) => void;
}

/** Préférences de thème, persistées comme `ui-kit-palette` / `ui-kit-theme` côté Angular (défaut : cyan, système). */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      paletteId: 'cyan',
      mode: 'system',
      setPalette: (paletteId) => set({ paletteId }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'ui-kit-theme',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Une palette inconnue (ancienne version) retombe sur cyan.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        const paletteId =
          p.paletteId && (PALETTE_ORDER as readonly string[]).includes(p.paletteId) ? p.paletteId : current.paletteId;
        const mode = p.mode === 'light' || p.mode === 'dark' || p.mode === 'system' ? p.mode : current.mode;
        return { ...current, paletteId, mode };
      },
    },
  ),
);
