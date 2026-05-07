'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number; username: string; email: string
  fullName: string | null; phone: string | null
  role: string; isActive: boolean
}

export default function UserForm({ user }: { user?: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isEdit = !!user

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const data = {
      username: (form.elements.namedItem('username') as HTMLInputElement).value,
      email:    (form.elements.namedItem('email')    as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      fullName: (form.elements.namedItem('fullName') as HTMLInputElement).value,
      phone:    (form.elements.namedItem('phone')    as HTMLInputElement).value,
      role:     (form.elements.namedItem('role')     as HTMLSelectElement).value,
      isActive: (form.elements.namedItem('isActive') as HTMLInputElement).checked,
    }

    const res = await fetch(isEdit ? `/api/users/${user.id}` : '/api/users', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      if (isEdit) {
        setSuccess('บันทึกข้อมูลสำเร็จ')
        router.refresh()
      } else {
        router.push('/users')
        router.refresh()
      }
    } else {
      const err = await res.json()
      setError(err.message ?? 'เกิดข้อผิดพลาด')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`ยืนยันการลบผู้ใช้ "${user?.username}"?`)) return
    const res = await fetch(`/api/users/${user?.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/users')
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
      {error   && <div className="mb-4 p-3 bg-red-50   text-red-600   rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ *</label>
            <input name="username" required defaultValue={user?.username ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
            <input name="email" type="email" required defaultValue={user?.email ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="email@company.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน *'}
          </label>
          <input name="password" type="password" required={!isEdit}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            placeholder="••••••••" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input name="fullName" defaultValue={user?.fullName ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="ชื่อ นามสกุล" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input name="phone" defaultValue={user?.phone ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              placeholder="0xx-xxx-xxxx" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน</label>
          <select name="role" defaultValue={user?.role ?? 'staff'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            <option value="manager">ผู้จัดการ (Manager)</option>
            <option value="staff">พนักงาน (Staff)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input name="isActive" type="checkbox" id="isActive" defaultChecked={user?.isActive ?? true}
            className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="isActive" className="text-sm text-gray-700">เปิดใช้งานบัญชีนี้</label>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
              {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน'}
            </button>
            <button type="button" onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              ยกเลิก
            </button>
          </div>
          {isEdit && (
            <button type="button" onClick={handleDelete}
              className="bg-red-50 text-red-600 px-6 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              ลบผู้ใช้
            </button>
          )}
        </div>
      </form>
    </div>
  )
}