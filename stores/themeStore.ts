import { create } from 'zustand';
import { Appearance } from 'react-native';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDark: typeof Appearance !== 'undefined' ? Appearance.getColorScheme() === 'dark' : false,
    toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    setTheme: (isDark: boolean) => set({ isDark }),
}));
