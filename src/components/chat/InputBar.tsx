import {
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { Paperclip, Send, Square, X } from 'lucide-react'
import { fileToBase64, validateImage } from '../../utils/image'
import { useToastStore } from '../../store/toastStore'

interface Props {
  isStreaming: boolean
  onSend: (text: string, images: string[]) => void
  onStop: () => void
}

export function InputBar({ isStreaming, onSend, onStop }: Props) {
  const [value, setValue] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const showToast = useToastStore((s) => s.showToast)

  const autoGrow = () => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }

  // 处理一批文件：校验 → 转 base64 → 入列
  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    for (const file of list) {
      const err = validateImage(file)
      if (err) {
        showToast(err, 'error')
        continue
      }
      try {
        const dataUrl = await fileToBase64(file)
        setImages((prev) => [...prev, dataUrl])
      } catch {
        showToast('图片读取失败', 'error')
      }
    }
  }

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = '' // 允许重复选择同一文件
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const imgFiles = Array.from(e.clipboardData.items)
      .filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
      .map((it) => it.getAsFile())
      .filter((f): f is File => f !== null)
    if (imgFiles.length) {
      e.preventDefault()
      addFiles(imgFiles)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const imgFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (imgFiles.length) addFiles(imgFiles)
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const submit = () => {
    const text = value.trim()
    if ((!text && images.length === 0) || isStreaming) return
    onSend(text, images)
    setValue('')
    setImages([])
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.style.height = 'auto'
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送 / Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = (!!value.trim() || images.length > 0) && !isStreaming

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
      <div
        className={`mx-auto max-w-3xl rounded-xl ${dragOver ? 'ring-2 ring-indigo-400' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* 缩略图预览行 */}
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((src, idx) => (
              <div key={idx} className="group relative h-16 w-16">
                <img
                  src={src}
                  alt={`upload-${idx}`}
                  className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  title="删除图片"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white shadow hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* 上传图片按钮 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePick}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            title="上传图片"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-500 transition hover:bg-gray-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              autoGrow()
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            disabled={isStreaming}
            placeholder={
              isStreaming ? '正在生成回复…' : '输入消息，可粘贴/拖拽图片，Enter 发送，Shift+Enter 换行'
            }
            className="max-h-[200px] flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              title="停止生成"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              title="发送"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
