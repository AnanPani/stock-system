'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Star } from 'lucide-react'

type UploadedImage = {
  url: string
  isPrimary: boolean
}

export default function ImageUploader({
  max = 4,
  folder = 'products',
  onChange,
}: {
  max?: number
  folder?: string
  onChange: (images: UploadedImage[]) => void
}) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const remaining = max - images.length
    if (remaining <= 0) return setError(`อัปโหลดได้สูงสุด ${max} รูป`)

    const selected = Array.from(files).slice(0, remaining)
    setUploading(true)
    setError('')

    const formData = new FormData()
    selected.forEach((f) => formData.append('files', f))
    formData.append('folder', folder)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })

    if (res.ok) {
      const data = await res.json()
      const newImages: UploadedImage[] = data.urls.map((url: string, i: number) => ({
        url,
        isPrimary: images.length === 0 && i === 0,
      }))
      const updated = [...images, ...newImages]
      setImages(updated)
      onChange(updated)
    } else {
      const err = await res.json()
      setError(err.message ?? 'อัปโหลดไม่สำเร็จ')
    }
    setUploading(false)
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true
    }
    setImages(updated)
    onChange(updated)
  }

  function handleSetPrimary(index: number) {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === index }))
    setImages(updated)
    onChange(updated)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      {images.length < max && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">
            {uploading ? 'กำลังอัปโหลด...' : 'คลิกหรือลากไฟล์มาวางที่นี่'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, WEBP ขนาดไม่เกิน 5MB (เหลืออีก {max - images.length} รูป)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={max > 1}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={img.url}
                alt={`รูปที่ ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              {/* Primary Badge */}
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Star size={10} />
                  หลัก
                </span>
              )}
              {/* Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full hover:bg-yellow-300"
                    title="ตั้งเป็นรูปหลัก"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  title="ลบรูป"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}