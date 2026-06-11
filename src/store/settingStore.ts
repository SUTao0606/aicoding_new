import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_MODEL, type ModelId } from '../types'

export type Theme = 'light' | 'dark'

interface SettingState {
  currentModel: ModelId
  temperature: number
  theme: Theme
  setModel: (model: ModelId) => void
  setTemperature: (t: number) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// 初始主题：localStorage 由 persist 恢复；首次无值时跟随系统
function systemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set, get) => ({
      currentModel: DEFAULT_MODEL,
      temperature: 0.7,
      theme: systemTheme(),
      setModel: (model) => set({ currentModel: model }),
      setTemperature: (temperature) => set({ temperature }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'qwen_settings',
      partialize: (s) => ({ theme: s.theme, currentModel: s.currentModel }),
    },
  ),
)
