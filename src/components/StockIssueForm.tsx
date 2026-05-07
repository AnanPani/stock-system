'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Plus, Trash2, ArrowUpCircle } from 'lucide-react'

type ProductImage = { id: number; url: string; isPrimary: boolean }
type Product = {
  id: number; code: string; name: string
  unit: string | null; quantity: number
  images: ProductImage[]
}
type IssueItem = {
  productId: number
  productName: string
  productCode: string
  unit: string
  currentQty: number
  issueQty: number
  note: string
}

export default function StockIssueForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<IssueItem[]>([])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  )

  function addItem(product: Product) {
    if (items.find((i) => i.productId === product.id)) return
    setItems([
      ...items,
      {
        productId:   product.id,
        productName: product.name,
        productCode: product.code,
        unit:        product.unit ?? 'ชิ้น',
        currentQty:  product.quantity,
        issueQty:    1,
        note:        '',
      },
    ])
    setSearch('')
  }

  function updateItem(index: number, field: 'issueQty' | 'note', value: number | string) {
    const updated = [...items]
    if (field === 'issueQty') updated[index].issueQty = value as number
    if (field === 'note') updated[index].note = value as string
    setItems(updated)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return setError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ')

    // เช็คสต็อกเพียงพอไหม
    const insufficient = items.find((item) => item.issueQty > item.currentQty)
    if (insufficient) {
      return setError(`สินค้า "${insufficient.productName}" มีสต็อกไม่เพียงพอ (คงเหลือ ${insufficient.currentQty} ${insufficient.unit})`)
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/stock-movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'issue',
        referenceNo,
        note,
        items,
      }),
    })

    if (res.ok) {
      router.push('/stock-movements')
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลการเบิกสินค้า</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่อ้างอิง</label>
            <input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              placeholder="เช่น REQ-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
              placeholder="เบิกเพื่อ..."
            />
          </div>
        </div>
      </div>

      {/* Product Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">เลือกสินค้าที่เบิกออก</h2>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
            placeholder="ค้นหาสินค้า..."
          />
        </div>

        {search && (
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 max-h-60 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-center py-4 text-gray-400 text-sm">ไม่พบสินค้า</p>
            ) : (
              filteredProducts.map((product) => {
                const primaryImg = product.images.find((img) => img.isPrimary) ?? product.images[0]
                const alreadyAdded = items.some((i) => i.productId === product.id)
                const outOfStock = product.quantity === 0
                return (
                  <div
                    key={product.id}
                    onClick={() => !alreadyAdded && !outOfStock && addItem(product)}
                    className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 transition-colors ${
                      alreadyAdded || outOfStock
                        ? 'bg-gray-50 cursor-not-allowed opacity-50'
                        : 'hover:bg-orange-50 cursor-pointer'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {primaryImg ? (
                        <Image src={primaryImg.url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className={`text-xs ${outOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                        {product.code} · คงเหลือ {product.quantity} {product.unit}
                        {outOfStock && ' (หมดสต็อก)'}
                      </p>
                    </div>
                    {!alreadyAdded && !outOfStock && <Plus size={16} className="text-orange-500" />}
                  </div>
                )
              })
            )}
          </div>
        )}

        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">สินค้า</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">คงเหลือปัจจุบัน</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium w-36">จำนวนที่เบิก</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">คงเหลือหลังเบิก</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">หมายเหตุ</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const afterQty = item.currentQty - item.issueQty
                const isOver = afterQty < 0
                return (
                  <tr key={item.productId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.productCode}</p>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.currentQty} {item.unit}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button"
                          onClick={() => updateItem(index, 'issueQty', Math.max(1, item.issueQty - 1))}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                        >−</button>
                        <input
                          type="number" min={1} value={item.issueQty}
                          onChange={(e) => updateItem(index, 'issueQty', Math.max(1, Number(e.target.value)))}
                          className={`w-14 text-center border rounded-lg py-1 text-sm focus:outline-none focus:ring-2 ${
                            isOver
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-orange-500'
                          }`}
                        />
                        <button type="button"
                          onClick={() => updateItem(index, 'issueQty', item.issueQty + 1)}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                        >+</button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${isOver ? 'text-red-600' : 'text-orange-600'}`}>
                        {afterQty} {item.unit}
                      </span>
                      {isOver && <p className="text-xs text-red-500">เกินสต็อก!</p>}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        value={item.note}
                        onChange={(e) => updateItem(index, 'note', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                        placeholder="หมายเหตุ"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button type="button" onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <ArrowUpCircle size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">ค้นหาและเพิ่มสินค้าที่ต้องการเบิกออก</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-orange-500 text-white px-8 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm font-medium">
          <ArrowUpCircle size={18} />
          {loading ? 'กำลังบันทึก...' : 'ยืนยันเบิกสินค้าออก'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          ยกเลิก
        </button>
      </div>
    </form>
  )
}