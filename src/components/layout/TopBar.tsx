import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Moon, Sparkles } from 'lucide-react'
import { MODEL_OPTIONS, type ModelId } from '../../types'
import { useSettingStore } from '../../store/settingStore'

export function TopBar() {
  const currentModel = useSettingStore((s) => s.currentModel)
  const setModel = useSettingStore((s) => s.setModel)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <span className="text-base font-semibold text-gray-800">千问 Chat</span>
      </div>

      <div className="flex items-center gap-3">
        <Select.Root value={currentModel} onValueChange={(v) => setModel(v as ModelId)}>
          <Select.Trigger
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="z-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <Select.Viewport className="p-1">
                {MODEL_OPTIONS.map((m) => (
                  <Select.Item
                    key={m.id}
                    value={m.id}
                    className="relative flex cursor-pointer select-none flex-col rounded-md px-8 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
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

        {/* 主题切换占位（Phase 5 实现） */}
        <button
          type="button"
          title="主题切换（Phase 5）"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          disabled
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
