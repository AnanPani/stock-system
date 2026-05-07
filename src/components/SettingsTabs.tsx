'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Tag, Truck } from 'lucide-react'

type Category = { id: number; name: string; description: string | null }
type Supplier = {
  id: number; name: string; code: string
  contactName: string | null; phone: string | null
  email: string | null; isActive: boolean
}

export default function SettingsTabs({
  categories,
  suppliers,
}: {
  categories: Category[]
  suppliers: Supplier[]
}) {
  const [tab, setTab] = useState<'categories' | 'suppliers'>('categories')

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'categories'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Tag size={16} />
          หมวดหมู่สินค้า
        </button>
        <button
          onClick={() => setTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'suppliers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Truck size={16} />
          ผู้จำหน่าย
        </button>
      </div>

      {tab === 'categories' && <CategoriesTab categories={categories} />}
      {tab === 'suppliers'  && <SuppliersTab  suppliers={suppliers}   />}
    </div>
  )
}

/* ============ CATEGORIES TAB ============ */
function CategoriesTab({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!name.trim()) return setError('กรุณาใส่ชื่อหมวดหมู่')
    setLoading(true)
    setError('')
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    if (res.ok) {
      setName('')
      setDescription('')
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('ยืนยันการลบหมวดหมู่นี้?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">เพิ่มหมวดหมู่ใหม่</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่ *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น วัตถุดิบ, สินค้าสำเร็จ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="คำอธิบายหมวดหมู่"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            <Plus size={16} />
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มหมวดหมู่'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          หมวดหมู่ทั้งหมด ({categories.length})
        </h2>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีหมวดหมู่</p>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/* ============ SUPPLIERS TAB ============ */
function SuppliersTab({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '', name: '', contactName: '', phone: '', email: '', address: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    if (!form.code.trim() || !form.name.trim()) return setError('กรุณาใส่รหัสและชื่อผู้จำหน่าย')
    setLoading(true)
    setError('')
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm({ code: '', name: '', contactName: '', phone: '', email: '', address: '' })
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('ยืนยันการลบผู้จำหน่ายนี้?')) return
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">เพิ่มผู้จำหน่ายใหม่</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัส *</label>
              <input name="code" value={form.code} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SUP001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="บริษัท..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ</label>
              <input name="contactName" value={form.contactName} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="คุณ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="02-xxx-xxxx" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input name="email" value={form.email} onChange={handleChange} type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@company.com" />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
          >
            <Plus size={16} />
            {loading ? 'กำลังเพิ่ม...' : 'เพิ่มผู้จำหน่าย'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ผู้จำหน่ายทั้งหมด ({suppliers.length})
        </h2>
        <div className="space-y-2">
          {suppliers.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีผู้จำหน่าย</p>
          ) : (
            suppliers.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.code} {s.phone ? `· ${s.phone}` : ''}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}