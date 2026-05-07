import { prisma } from '@/lib/prisma'
import SettingsTabs from '@/components/SettingsTabs'

export default async function SettingsPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
      <SettingsTabs categories={categories} suppliers={suppliers} />
    </div>
  )
}