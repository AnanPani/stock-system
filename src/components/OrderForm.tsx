'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, Search } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'

type ProductImage = { id: number; url: string; isPrimary: boolean }
type Product = {
  id: number; code: string; name: string
  unit: string | null; priceBuy: unknown; priceSell: unknown
  quantity: number; images: ProductImage[]
}
type Supplier = { id: number; code: string; name: string }
type OrderItem = {
  productId: number
  productName: string
  productCode: string
  unit: string
  quantity: number
  unitPrice: number
}
type AttachmentImage = { url: string; isPrimary: boolean }

export default function OrderForm({
  products,
  suppliers,
}: {
  products: Product[]
  suppliers: Supplier[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('purchase')
  const [supplierId, setSupplierId] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [attachment, setAttachment] = useState<AttachmentImage[]>([])
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  function addItem(product: Product) {
    const exists = items.find((i) => i.productId === product.id)
    if (exists) return

    setItems([
      ...items,
      {
        productId:   product.id,
        productName: product.name,
        productCode: product.code,
        unit:        product.unit ?? 'ชิ้น',
        quantity:    1,
        unitPrice:   Number(type === 'purchase' ? product.priceBuy : product.priceSell),
      },
    ])
    setSearch('')
  }

  function updateItem(index: number, field: 'quantity' | 'unitPrice', value: number) {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return setError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        supplierId: supplierId ? Number(supplierId) : null,
        note,
        totalAmount,
        items,
        attachment: attachment[0]?.url ?? null,
      }),
    })

    if (res.ok) {
      router.push('/orders')
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลออเดอร์</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทออเดอร์</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="purchase">สั่งซื้อเข้า (PO)</option>
              <option value="sale">ขายออก (SO)</option>
              <option value="internal">เบิกภายใน</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ผู้จำหน่าย</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกผู้จำหน่าย --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="หมายเหตุเพิ่มเติม"
            />
          </div>
        </div>
      </div>

      {/* Product Search & Add */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">เพิ่มสินค้า</h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="ค้นหาสินค้าด้วยชื่อหรือรหัส..."
          />
        </div>

        {/* Search Results */}
        {search && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 max-h-60 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-center py-4 text-gray-400 text-sm">ไม่พบสินค้า</p>
            ) : (
              filteredProducts.map((product) => {
                const primaryImg = product.images.find((img) => img.isPrimary) ?? product.images[0]
                const alreadyAdded = items.some((i) => i.productId === product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => !alreadyAdded && addItem(product)}
                    className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 transition-colors ${
                      alreadyAdded
                        ? 'bg-gray-50 cursor-not-allowed opacity-50'
                        : 'hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {primaryImg ? (
                        <Image src={primaryImg.url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.code} · คงเหลือ {product.quantity} {product.unit}</p>
                    </div>
                    {!alreadyAdded && (
                      <Plus size={16} className="text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Order Items Table */}
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">สินค้า</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium w-32">จำนวน</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium w-36">ราคา/หน่วย</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium w-36">รวม</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.productId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.productCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="w-14 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-full text-right border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      ฿{(item.quantity * item.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="py-3 px-4 text-right font-semibold text-gray-700">
                    ยอดรวมทั้งหมด
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600 text-base">
                    ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm">ค้นหาและเพิ่มสินค้าด้านบน</p>
          </div>
        )}
      </div>

      {/* Attachment */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">เอกสารแนบ</h2>
        <p className="text-xs text-gray-400 mb-4">แนบรูปใบสั่งซื้อ, ใบเสนอราคา หรือเอกสารที่เกี่ยวข้อง (1 รูป)</p>
        <ImageUploader max={1} folder="orders" onChange={setAttachment} />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'กำลังบันทึก...' : 'สร้างออเดอร์'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  )
}