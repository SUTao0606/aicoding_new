import { useEffect } from 'react'
import { useSettingStore } from '../store/settingStore'

/** 根据 settingStore.theme 给 <html> 加/去 dark class */
export function useTheme() {
  const theme = useSettingStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])
}
