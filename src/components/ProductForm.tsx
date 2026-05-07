'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/ImageUploader'

type UploadedImage = { url: string; isPrimary: boolean }
type Category = { id: number; name: string }
type Supplier = { id: number; name: string }

export default function ProductForm({ categories, suppliers }: {
  categories: Category[]
  suppliers: Supplier[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // บังคับอย่างน้อย 1 รูป
    if (images.length === 0) {
      setError('กรุณาอัปโหลดรูปสินค้าอย่างน้อย 1 รูป')
      setLoading(false)
      return
    }

    const form = e.currentTarget
    const data = {
      code:        (form.elements.namedItem('code')        as HTMLInputElement).value,
      name:        (form.elements.namedItem('name')        as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      categoryId:  (form.elements.namedItem('categoryId')  as HTMLSelectElement).value,
      supplierId:  (form.elements.namedItem('supplierId')  as HTMLSelectElement).value,
      unit:        (form.elements.namedItem('unit')        as HTMLInputElement).value,
      priceBuy:    (form.elements.namedItem('priceBuy')    as HTMLInputElement).value,
      priceSell:   (form.elements.namedItem('priceSell')   as HTMLInputElement).value,
      quantity:    (form.elements.namedItem('quantity')    as HTMLInputElement).value,
      minStock:    (form.elements.namedItem('minStock')    as HTMLInputElement).value,
      location:    (form.elements.namedItem('location')    as HTMLInputElement).value,
      images,
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push('/products')
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* รูปภาพสินค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            รูปภาพสินค้า <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(สูงสุด 4 รูป)</span>
          </label>
          <ImageUploader max={4} folder="products" onChange={setImages} />
        </div>

        {/* fields เดิม */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสินค้า *</label>
            <input name="code" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" placeholder="PRD001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
            <input name="name" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" placeholder="ชื่อสินค้า" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
          <textarea name="description" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" placeholder="รายละเอียดสินค้า" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select name="categoryId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้จำหน่าย</label>
            <select name="supplierId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือกผู้จำหน่าย --</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
            <input name="unit" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" placeholder="ชิ้น, กล่อง" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุน</label>
            <input name="priceBuy" type="number" step="0.01" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย</label>
            <input name="priceSell" type="number" step="0.01" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเริ่มต้น</label>
            <input name="quantity" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สต็อกขั้นต่ำ</label>
            <input name="minStock" type="number" defaultValue="10" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่งในคลัง</label>
            <input name="location" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" placeholder="A1-01" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
            {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  )
}