import UserForm from '@/components/UserForm'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">เพิ่มผู้ใช้งานใหม่</h1>
      <UserForm />
    </div>
  )
}