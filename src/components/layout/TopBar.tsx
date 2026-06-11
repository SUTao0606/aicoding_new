import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Menu, Moon, Sparkles, Sun } from 'lucide-react'
import { MODEL_OPTIONS, type ModelId } from '../../types'
import { useSettingStore } from '../../store/settingStore'

interface Props {
  onOpenSidebar: () => void
}

export function TopBar({ onOpenSidebar }: Props) {
  const currentModel = useSettingStore((s) => s.currentModel)
  const setModel = useSettingStore((s) => s.setModel)
  const theme = useSettingStore((s) => s.theme)
  const toggleTheme = useSettingStore((s) => s.toggleTheme)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        {/* 移动端汉堡菜单 */}
        <button
          type="button"
          onClick={onOpenSidebar}
          title="打开会话列表"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Sparkles className="hidden h-5 w-5 text-indigo-500 sm:block" />
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100">千问 Chat</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select.Root value={currentModel} onValueChange={(v) => setModel(v as ModelId)}>
          <Select.Trigger
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="选择模型"
          >
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <Select.Viewport className="p-1">
                {MODEL_OPTIONS.map((m) => (
                  <Select.Item
                    key={m.id}
                    value={m.id}
                    className="relative flex cursor-pointer select-none flex-col rounded-md px-8 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700 dark:text-gray-200 dark:data-[highlighted]:bg-indigo-500/20 dark:data-[highlighted]:text-indigo-300"
                  >
                    <Select.ItemText>{m.name}</Select.ItemText>
                    <span className="text-xs text-gray-400">{m.description}</span>
                    <Select.ItemIndicator className="absolute left-2 top-2.5">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* 主题切换 */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换到亮色' : '切换到暗色'}
          aria-label="切换主题"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
