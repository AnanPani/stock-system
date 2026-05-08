'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package, X, ZoomIn } from 'lucide-react'

type ProductImage = {
  id: number
  url: string
  isPrimary: boolean
  productId: number
  createdAt: string
}

type Category = { id: number; name: string } | null
type Supplier = { id: number; name: string } | null

type Product = {
  id: number
  code: string
  name: string
  description: string | null
  priceBuy: number
  priceSell: number
  quantity: number
  minStock: number
  maxStock: number
  unit: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: Category
  supplier: Supplier
  images: ProductImage[]
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxName, setLightboxName] = useState('')
  const [visible, setVisible] = useState(false)

  function openLightbox(url: string, name: string) {
    setLightboxUrl(url)
    setLightboxName(name)
    setTimeout(() => setVisible(true), 10)
  }

  function closeLightbox() {
    setVisible(false)
    setTimeout(() => {
      setLightboxUrl(null)
      setLightboxName('')
    }, 200)
  }

  // กด ESC เพื่อปิด
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium w-16">รูป</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">รหัส</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ชื่อสินค้า</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">หมวดหมู่</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">คงเหลือ</th>
              <th className="text-right py-3 px-4 text-gray-500 font-medium">ราคาขาย</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">สถานะ</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-30" />
                  <p>ยังไม่มีสินค้า</p>
                  <Link
                    href="/products/new"
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                  >
                    + เพิ่มสินค้าแรก
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImage = product.images[0] ?? null
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* รูปภาพ */}
                    <td className="py-3 px-4">
                      <div
                        className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 cursor-pointer group"
                        onClick={() =>
                          primaryImage && openLightbox(primaryImage.url, product.name)
                        }
                      >
                        {primaryImage ? (
                          <>
                            <Image
                              src={primaryImage.url}
                              alt={product.name}
                              width={48}
                              height={48}
                              sizes="48px"
                              className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn
                                size={16}
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </>
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                    </td>

                    {/* รหัส */}
                    <td className="py-3 px-4 font-mono text-gray-500 text-xs">
                      {product.code}
                    </td>

                    {/* ชื่อสินค้า */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </td>

                    {/* หมวดหมู่ */}
                    <td className="py-3 px-4">
                      {product.category ? (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* คงเหลือ */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`font-bold ${
                          product.quantity <= product.minStock
                            ? 'text-red-600'
                            : 'text-gray-800'
                        }`}>
                          {product.quantity.toLocaleString('th-TH')}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="text-xs text-gray-400">
                          {product.maxStock.toLocaleString('th-TH')}
                        </span>
                        {product.unit && (
                          <span className="text-xs text-gray-300">{product.unit}</span>
                        )}
                      </div>
                      {product.quantity <= product.minStock && (
                        <p className="text-xs text-red-400 mt-0.5">⚠ ใกล้หมด</p>
                      )}
                    </td>

                    {/* ราคาขาย */}
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      ฿{product.priceSell.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* สถานะ */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.isActive ? 'ใช้งาน' : 'ปิดใช้'}
                      </span>
                    </td>

                    {/* จัดการ */}
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        {products.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            ทั้งหมด {products.length.toLocaleString('th-TH')} รายการ
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
            visible ? 'bg-black/85' : 'bg-black/0'
          }`}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2.5 transition-colors z-10"
          >
            <X size={22} />
          </button>

          {/* ESC hint + Product Name */}
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 transition-all duration-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            <div className="text-white text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full">
              {lightboxName}
            </div>
            <div className="text-white/40 text-xs bg-black/30 px-2 py-1 rounded-full">
              ESC
            </div>
          </div>

          {/* Image */}
          <div
            className={`relative w-full max-w-2xl aspect-square transition-all duration-200 ${
              visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt={lightboxName}
              fill
              sizes="90vw"
              className="object-contain rounded-xl"
            />
          </div>

          {/* Hint */}
          <p className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs transition-all duration-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}>
            คลิกพื้นหลังหรือกด ESC เพื่อปิด
          </p>
        </div>
      )}
    </>
  )
}