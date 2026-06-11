import { AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            t.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
              : 'border-indigo-200 bg-white text-gray-700 dark:border-indigo-500/30 dark:bg-gray-800 dark:text-gray-200'
          }`}
        >
          {t.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-black/5 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
