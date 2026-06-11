import type { ContentPart } from '../types'

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20MB

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/** 本地图片文件 → base64 data URL */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

/** 校验图片类型与大小，通过返回 null，否则返回错误信息 */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `不支持的图片格式：${file.type || '未知'}（仅支持 JPG/PNG/WEBP/GIF）`
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `图片过大（${mb}MB），上限 20MB`
  }
  return null
}

/** 构建多模态 content 数组：图片块在前，文本块在后 */
export function buildMultimodalContent(text: string, images: string[]): ContentPart[] {
  const parts: ContentPart[] = images.map((url) => ({
    type: 'image_url',
    image_url: { url },
  }))
  if (text.trim()) {
    parts.push({ type: 'text', text: text.trim() })
  }
  return parts
}
