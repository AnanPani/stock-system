'use client'

import { useState } from 'react'
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function NotifyButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  async function handleTest() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/notify/low-stock', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
        },
      })
      const data = await res.json()

      if (res.ok) {
        setResult({
          type:    data.count > 0 ? 'success' : 'info',
          message: data.count > 0
            ? `✅ ส่งแจ้งเตือน ${data.count} รายการไปที่ Discord แล้ว`
            : 'ℹ️ ไม่มีสินค้าใกล้หมดในขณะนี้',
        })
      } else {
        setResult({ type: 'error', message: data.message ?? 'เกิดข้อผิดพลาด' })
      }
    } catch {
      setResult({ type: 'error', message: 'เชื่อมต่อไม่ได้' })
    }

    setLoading(false)
    setTimeout(() => setResult(null), 5000)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleTest}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
      >
        <Bell size={16} />
        {loading ? 'กำลังส่ง...' : 'ทดสอบแจ้งเตือน Discord'}
      </button>

      {result && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
          result.type === 'success' ? 'bg-green-50  text-green-700' :
          result.type === 'error'   ? 'bg-red-50    text-red-600'   :
                                      'bg-blue-50   text-blue-600'
        }`}>
          {result.type === 'success' ? <CheckCircle  size={16} /> :
           result.type === 'error'   ? <XCircle      size={16} /> :
                                       <AlertCircle  size={16} />}
          {result.message}
        </div>
      )}
    </div>
  )
}