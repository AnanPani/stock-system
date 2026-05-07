import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, UserCheck, UserX } from 'lucide-react'

const roleLabel: Record<string, string> = {
  admin:   'ผู้ดูแลระบบ',
  manager: 'ผู้จัดการ',
  staff:   'พนักงาน',
}

const roleColor: Record<string, string> = {
  admin:   'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  staff:   'bg-gray-100 text-gray-600',
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ผู้ใช้งานทั้งหมด</h1>
        <Link
          href="/users/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={18} />
          เพิ่มผู้ใช้งาน
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ชื่อผู้ใช้</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">ชื่อ-นามสกุล</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">อีเมล</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">สิทธิ์</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">สถานะ</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">วันที่สร้าง</th>
              <th className="text-center py-3 px-4 text-gray-500 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  ยังไม่มีผู้ใช้งาน
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{user.username}</td>
                  <td className="py-3 px-4 text-gray-600">{user.fullName ?? '-'}</td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {roleLabel[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.isActive
                      ? <UserCheck size={18} className="inline text-green-500" />
                      : <UserX    size={18} className="inline text-red-400"   />
                    }
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline text-xs">
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}