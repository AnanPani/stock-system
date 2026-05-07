'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle, XCircle, PlayCircle, Clock } from 'lucide-react'

const transitions: Record<string, { label: string; next: string; color: string; icon: React.ElementType }[]> = {
  draft:      [{ label: 'ส่งรออนุมัติ',    next: 'pending',    color: 'bg-yellow-500 hover:bg-yellow-600', icon: Clock        }],
  pending:    [
    { label: 'อนุมัติ',       next: 'approved',   color: 'bg-blue-600 hover:bg-blue-700',     icon: CheckCircle  },
    { label: 'ยกเลิก',        next: 'cancelled',  color: 'bg-red-500 hover:bg-red-600',       icon: XCircle      },
  ],
  approved:   [
    { label: 'เริ่มดำเนินการ', next: 'processing', color: 'bg-purple-600 hover:bg-purple-700', icon: PlayCircle   },
    { label: 'ยกเลิก',        next: 'cancelled',  color: 'bg-red-500 hover:bg-red-600',       icon: XCircle      },
  ],
  processing: [
    { label: 'เสร็จสิ้น',     next: 'completed',  color: 'bg-green-600 hover:bg-green-700',   icon: CheckCircle  },
    { label: 'ยกเลิก',        next: 'cancelled',  color: 'bg-red-500 hover:bg-red-600',       icon: XCircle      },
  ],
}

export default function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: number
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const actions = transitions[currentStatus] ?? []

  if (actions.length === 0) return null

  async function handleAction(nextStatus: string) {
    setLoading(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">อัปเดตสถานะ</h2>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.next}
              onClick={() => handleAction(action.next)}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium ${action.color}`}
            >
              <Icon size={18} />
              {loading ? 'กำลังอัปเดต...' : action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}