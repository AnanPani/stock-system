'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useRouter } from 'next/navigation'

type ProductImage = {
  id: number
  url: string
  isPrimary: boolean
  productId: number
  createdAt: string
}

export default function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductImage[]
  productName: string
}) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(
    () => images.findIndex((img) => img.isPrimary) ?? 0
  )
  const [lightbox, setLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [settingPrimary, setSettingPrimary] = useState(false)

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">รูปภาพสินค้า</h2>
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
          ไม่มีรูปภาพ
        </div>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]

  async function handleSetPrimary(imageId: number) {
    setSettingPrimary(true)
    await fetch(`/api/product-images/${imageId}/primary`, { method: 'PATCH' })
    router.refresh()
    setSettingPrimary(false)
  }

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightbox(true)
  }

  function prevLightbox() {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  function nextLightbox() {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">รูปภาพสินค้า</h2>

        {/* Primary Display */}
        <div
          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in group"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={activeImage.url}
            alt={productName}
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {/* Primary Badge */}
          {activeImage.isPrimary && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Star size={10} />
              รูปหลัก
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((img, index) => (
              <div key={img.id} className="relative group">
                <div
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    activeIndex === index
                      ? 'border-blue-500 scale-95'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${productName} ${index + 1}`}
                    fill
                    sizes="10vw"
                    className="object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-0.5 left-0.5 bg-yellow-400 rounded-full p-0.5">
                      <Star size={8} className="text-yellow-900" />
                    </div>
                  )}
                </div>

                {/* Set Primary Button */}
                {!img.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={settingPrimary}
                    className="absolute bottom-1 right-1 bg-yellow-400 text-yellow-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-300 disabled:opacity-50"
                    title="ตั้งเป็นรูปหลัก"
                  >
                    <Star size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Hover ที่รูปแล้วกด ⭐ เพื่อตั้งเป็นรูปหลัก
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevLightbox() }}
              className="absolute left-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={`${productName} ${lightboxIndex + 1}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextLightbox() }}
              className="absolute right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(index) }}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    lightboxIndex === index
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`thumb ${index + 1}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}