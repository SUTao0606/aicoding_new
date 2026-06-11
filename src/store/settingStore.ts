import { create } from 'zustand'
import { DEFAULT_MODEL, type ModelId } from '../types'

interface SettingState {
  currentModel: ModelId
  temperature: number
  setModel: (model: ModelId) => void
  setTemperature: (t: number) => void
}

export const useSettingStore = create<SettingState>((set) => ({
  currentModel: DEFAULT_MODEL,
  temperature: 0.7,
  setModel: (model) => set({ currentModel: model }),
  setTemperature: (temperature) => set({ temperature }),
}))
