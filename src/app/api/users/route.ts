import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const hashed = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email:    body.email,
        password: hashed,
        fullName: body.fullName || null,
        phone:    body.phone    || null,
        role:     body.role     ?? 'staff',
        isActive: body.isActive ?? true,
      },
    })
    const { password: _, ...safeUser } = user
    return NextResponse.json(safeUser, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}