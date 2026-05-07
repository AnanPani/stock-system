'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, ShoppingCart,
  ArrowLeftRight, Users, BarChart2, Settings, LogOut,
} from 'lucide-react'

const menus = [
  { href: '/dashboard',       label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/products',        label: 'สินค้า',         icon: Package         },
  { href: '/orders',          label: 'ออเดอร์',        icon: ShoppingCart    },
  { href: '/stock-movements', label: 'รับ/เบิกสินค้า', icon: ArrowLeftRight  },
  { href: '/users',           label: 'ผู้ใช้งาน',      icon: Users           },
  { href: '/reports',         label: 'รายงาน',         icon: BarChart2       },
  { href: '/settings',        label: 'ตั้งค่า',        icon: Settings        },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">📦 StockSystem</h1>
        <p className="text-xs text-gray-400 mt-1">ระบบจัดการสต็อก</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon
          const isActive = pathname.startsWith(menu.href)
          return (
            <Link key={menu.href} href={menu.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {menu.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-gray-700">
        {session?.user && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(session.user.fullName ?? session.user.name ?? 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user.fullName ?? session.user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{session.user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}