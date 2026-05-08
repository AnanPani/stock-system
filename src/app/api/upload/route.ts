import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null)

    if (!formData) {
      return NextResponse.json({ message: 'ไม่สามารถอ่านข้อมูลได้' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) ?? 'misc'

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'ไม่พบไฟล์' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const urls: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น' },
          { status: 400 }
        )
      }

      // เปลี่ยนจาก 5MB เป็น 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { message: `ไฟล์ ${file.name} ใหญ่เกิน 10MB` },
          { status: 400 }
        )
      }

      const bytes    = await file.arrayBuffer()
      const buffer   = Buffer.from(bytes)
      const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filepath = path.join(uploadDir, filename)

      await writeFile(filepath, buffer)
      urls.push(`/uploads/${folder}/${filename}`)
    }

    return NextResponse.json({ urls }, { status: 201 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    return NextResponse.json({ message }, { status: 500 })
  }
}