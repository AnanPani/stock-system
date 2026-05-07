import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UserForm from '@/components/UserForm'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id: Number(id) } })
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{user.fullName ?? user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <UserForm user={user} />
    </div>
  )
}