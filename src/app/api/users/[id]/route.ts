import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id: Number(id) } })
  if (!user) return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 })
  const { password: _, ...safeUser } = user
  return NextResponse.json(safeUser)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {
      username: body.username,
      email:    body.email,
      fullName: body.fullName || null,
      phone:    body.phone    || null,
      role:     body.role,
      isActive: body.isActive,
    }
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10)
    }
    const user = await prisma.user.update({ where: { id: Number(id) }, data })
    const { password: _, ...safeUser } = user
    return NextResponse.json(safeUser)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}