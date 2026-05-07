'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: number; name: string }
type Supplier = { id: number; name: string }
type Product = {
  id: number; code: string; name: string
  description: string | null; categoryId: number | null
  supplierId: number | null; unit: string | null
  priceBuy: unknown; priceSell: unknown
  minStock: number; maxStock: number
  location: string | null; isActive: boolean
}

export default function ProductEditForm({
  product,
  categories,
  suppliers,
}: {
  product: Product
  categories: Category[]
  suppliers: Supplier[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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
      minStock:    (form.elements.namedItem('minStock')    as HTMLInputElement).value,
      maxStock:    (form.elements.namedItem('maxStock')    as HTMLInputElement).value,
      location:    (form.elements.namedItem('location')    as HTMLInputElement).value,
      isActive:    (form.elements.namedItem('isActive')    as HTMLInputElement).checked,
    }

    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setSuccess('บันทึกข้อมูลสำเร็จ')
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`ยืนยันการลบสินค้า "${product.name}"?`)) return
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/products')
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">แก้ไขข้อมูลสินค้า</h2>

      {error   && <div className="mb-4 p-3 bg-red-50   text-red-600   rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสสินค้า *</label>
            <input name="code" required defaultValue={product.code}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
            <input name="name" required defaultValue={product.name}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
          <textarea name="description" rows={3} defaultValue={product.description ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select name="categoryId" defaultValue={product.categoryId ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้จำหน่าย</label>
            <select name="supplierId" defaultValue={product.supplierId ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือกผู้จำหน่าย --</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
            <input name="unit" defaultValue={product.unit ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="ชิ้น, กล่อง" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุน</label>
            <input name="priceBuy" type="number" step="0.01" defaultValue={Number(product.priceBuy)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย</label>
            <input name="priceSell" type="number" step="0.01" defaultValue={Number(product.priceSell)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สต็อกขั้นต่ำ</label>
            <input name="minStock" type="number" defaultValue={product.minStock}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สต็อกสูงสุด</label>
            <input name="maxStock" type="number" defaultValue={product.maxStock}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่งในคลัง</label>
            <input name="location" defaultValue={product.location ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="A1-01" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input name="isActive" type="checkbox" id="isActive" defaultChecked={product.isActive}
            className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="isActive" className="text-sm text-gray-700">เปิดใช้งานสินค้านี้</label>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              ยกเลิก
            </button>
          </div>
          <button type="button" onClick={handleDelete}
            className="bg-red-50 text-red-600 px-6 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
            ลบสินค้า
          </button>
        </div>
      </form>
    </div>
  )
}