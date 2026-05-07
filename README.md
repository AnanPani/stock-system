---
markdown# 📦 Stock Management System

ระบบจัดการสต็อกสินค้าและออเดอร์ สำหรับธุรกิจขนาดเล็กถึงกลาง พัฒนาด้วย Next.js 16, TypeScript, Prisma และ PostgreSQL
---

## 🖥️ หน้าจอระบบ

| หน้า           | คำอธิบาย                                |
| -------------- | --------------------------------------- |
| Dashboard      | ภาพรวมสต็อก, ออเดอร์, และสินค้าใกล้หมด  |
| สินค้า         | จัดการสินค้า เพิ่ม/แก้ไข/ลบ พร้อมรูปภาพ |
| ออเดอร์        | สร้างและติดตาม PO/SO พร้อมเอกสารแนบ     |
| รับ/เบิกสินค้า | บันทึกการรับเข้าและเบิกออกจากคลัง       |
| ผู้ใช้งาน      | จัดการสิทธิ์ Admin / Manager / Staff    |
| รายงาน         | สรุปสต็อกและออเดอร์                     |
| ตั้งค่า        | จัดการหมวดหมู่และผู้จำหน่าย             |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16
- **Auth**: NextAuth v5 (Credentials)
- **CI/CD**: Jenkins (planned)

---

## 📋 ความต้องการระบบ

- Node.js 20+
- PostgreSQL 16+
- npm 10+

---

## 🚀 วิธีติดตั้งและรัน

### 1. Clone โปรเจค

```bash
git clone https://github.com/YOUR_USERNAME/stock-system.git
cd stock-system
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/stockdb?schema=public"
AUTH_SECRET="your-secret-key"
```

### 4. สร้าง Database Schema

```bash
npx prisma db push
npx prisma generate
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 🗄️ โครงสร้างฐานข้อมูล

users ผู้ใช้งานระบบ (Admin / Manager / Staff)
categories หมวดหมู่สินค้า
suppliers ผู้จำหน่าย
products สินค้า
product_images รูปภาพสินค้า (สูงสุด 4 รูป)
orders ออเดอร์ (PO / SO / Internal)
order_items รายการสินค้าในออเดอร์
order_attachments เอกสารแนบออเดอร์
stock_movements บันทึกการรับ/เบิก/ปรับยอดสต็อก

---

## 📁 โครงสร้างโปรเจค

stock-system/
├── src/
│ ├── app/
│ │ ├── (dashboard)/ หน้าหลักทั้งหมด
│ │ │ ├── dashboard/ หน้า Dashboard
│ │ │ ├── products/ จัดการสินค้า
│ │ │ ├── orders/ จัดการออเดอร์
│ │ │ ├── stock-movements/ รับ/เบิกสินค้า
│ │ │ ├── users/ จัดการผู้ใช้
│ │ │ ├── reports/ รายงาน
│ │ │ └── settings/ ตั้งค่า
│ │ ├── api/ API Routes
│ │ └── login/ หน้า Login
│ ├── components/ React Components
│ ├── lib/ Utilities (Prisma, Auth, Utils)
│ └── types/ TypeScript Types
├── prisma/
│ └── schema.prisma Database Schema
├── public/
│ └── uploads/ รูปภาพที่อัปโหลด
├── scripts/
│ └── seed-admin.ts สร้าง Admin User
├── .env.example ตัวอย่าง Environment Variables
└── README.md

---

## 👤 สิทธิ์การใช้งาน

| สิทธิ์  | คำอธิบาย                               |
| ------- | -------------------------------------- |
| Admin   | เข้าถึงได้ทุกส่วน รวมถึงจัดการผู้ใช้   |
| Manager | จัดการสินค้า ออเดอร์ และรับ/เบิกสินค้า |
| Staff   | ดูข้อมูลและบันทึกการรับ/เบิกสินค้า     |

---

## 🔄 CI/CD Pipeline (Jenkins)

Git Push → Jenkins Webhook
→ Lint (ESLint)
→ Test (Jest)
→ Build (next build)
→ Docker Build
→ Deploy Staging
→ Deploy Production

> 📌 Jenkins configuration อยู่ในแผนพัฒนาต่อไป

---

## 📝 TODO

- [ ] ระบบแจ้งเตือนสต็อกใกล้หมด (Email / Line)
- [ ] Export รายงาน PDF / Excel
- [ ] Search และ Filter ในหน้าสินค้าและออเดอร์
- [ ] Jenkins CI/CD Pipeline
- [ ] Unit Tests
- [ ] Docker Compose สำหรับ Production

---

## 🤝 การพัฒนาต่อ

```bash
# สร้าง branch ใหม่
git checkout -b feature/your-feature

# Commit
git add .
git commit -m "feat: your feature description"

# Push
git push origin feature/your-feature
```

---

## 📄 License

MIT License — สามารถนำไปใช้และแก้ไขได้อย่างอิสระ
