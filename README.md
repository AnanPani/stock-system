# 📦 Stock Management System

ระบบจัดการสต็อกสินค้าและออเดอร์ สำหรับธุรกิจขนาดเล็กถึงกลาง พัฒนาด้วย Next.js 16, TypeScript, Prisma และ PostgreSQL

---

## 🖥️ หน้าจอระบบ

| หน้า           | คำอธิบาย                                                         |
| -------------- | ---------------------------------------------------------------- |
| Dashboard      | ภาพรวมสต็อก, ออเดอร์, สินค้าใกล้หมด และปุ่มทดสอบแจ้งเตือน        |
| สินค้า         | จัดการสินค้า เพิ่ม/แก้ไข/ลบ พร้อมรูปภาพสูงสุด 4 รูป และ Lightbox |
| ออเดอร์        | สร้างและติดตาม PO/SO พร้อมเอกสารแนบและอัปเดตสถานะ                |
| รับ/เบิกสินค้า | บันทึกการรับเข้าและเบิกออกจากคลัง                                |
| ผู้ใช้งาน      | จัดการสิทธิ์ Admin / Manager / Staff                             |
| รายงาน         | สรุปสต็อก มูลค่า และออเดอร์                                      |
| ตั้งค่า        | จัดการหมวดหมู่และผู้จำหน่าย                                      |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes, Prisma ORM 7
- **Database**: PostgreSQL 16
- **Auth**: NextAuth v5 (Credentials + JWT)
- **Notification**: Discord Webhook
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
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxxx/yyyy"
CRON_SECRET="your-cron-secret"
NEXT_PUBLIC_CRON_SECRET="your-cron-secret"
```

### 4. สร้าง Database Schema

```bash
npx prisma db push
npx prisma generate
```

### 5. สร้าง Admin User

```bash
npx tsx scripts/seed-admin.ts
```

ค่าเริ่มต้น:

- **Username**: `admin`
- **Password**: `admin1234`

> ⚠️ กรุณาเปลี่ยนรหัสผ่านหลังจาก Login ครั้งแรก

### 6. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 🗄️ โครงสร้างฐานข้อมูล

```
users              ผู้ใช้งานระบบ (Admin / Manager / Staff)
categories         หมวดหมู่สินค้า
suppliers          ผู้จำหน่าย
products           สินค้า
product_images     รูปภาพสินค้า (สูงสุด 4 รูป)
orders             ออเดอร์ (PO / SO / Internal)
order_items        รายการสินค้าในออเดอร์
order_attachments  เอกสารแนบออเดอร์
stock_movements    บันทึกการรับ/เบิก/ปรับยอดสต็อก
```

---

## 📁 โครงสร้างโปรเจค

```
stock-system/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          หน้าหลักทั้งหมด
│   │   │   ├── dashboard/        หน้า Dashboard
│   │   │   ├── products/         จัดการสินค้า
│   │   │   ├── orders/           จัดการออเดอร์
│   │   │   ├── stock-movements/  รับ/เบิกสินค้า
│   │   │   ├── users/            จัดการผู้ใช้
│   │   │   ├── reports/          รายงาน
│   │   │   └── settings/         ตั้งค่า
│   │   ├── api/                  API Routes
│   │   │   ├── auth/             NextAuth Handler
│   │   │   ├── products/         CRUD สินค้า
│   │   │   ├── orders/           CRUD ออเดอร์
│   │   │   ├── stock-movements/  รับ/เบิกสินค้า
│   │   │   ├── categories/       CRUD หมวดหมู่
│   │   │   ├── suppliers/        CRUD ผู้จำหน่าย
│   │   │   ├── users/            CRUD ผู้ใช้
│   │   │   ├── upload/           อัปโหลดรูปภาพ
│   │   │   ├── notify/           ระบบแจ้งเตือน Discord
│   │   │   └── product-images/   จัดการรูปสินค้า
│   │   └── login/                หน้า Login
│   ├── components/               React Components
│   │   ├── Sidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductEditForm.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── ProductsTable.tsx
│   │   ├── OrderForm.tsx
│   │   ├── OrderStatusActions.tsx
│   │   ├── StockReceiveForm.tsx
│   │   ├── StockIssueForm.tsx
│   │   ├── UserForm.tsx
│   │   ├── SettingsTabs.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── NotifyButton.tsx
│   │   └── Providers.tsx
│   ├── lib/                      Utilities
│   │   ├── prisma.ts             Prisma Client
│   │   ├── auth.ts               NextAuth Config
│   │   ├── notify.ts             Discord Webhook
│   │   └── utils.ts              Helper Functions
│   └── types/                    TypeScript Types
│       └── next-auth.d.ts
├── prisma/
│   └── schema.prisma             Database Schema
├── public/
│   └── uploads/                  รูปภาพที่อัปโหลด
├── scripts/
│   └── seed-admin.ts             สร้าง Admin User
├── .env.example
└── README.md
```

---

## 👤 สิทธิ์การใช้งาน

| สิทธิ์  | คำอธิบาย                               |
| ------- | -------------------------------------- |
| Admin   | เข้าถึงได้ทุกส่วน รวมถึงจัดการผู้ใช้   |
| Manager | จัดการสินค้า ออเดอร์ และรับ/เบิกสินค้า |
| Staff   | ดูข้อมูลและบันทึกการรับ/เบิกสินค้า     |

---

## 🔔 ระบบแจ้งเตือน Discord

ระบบจะส่งแจ้งเตือนไปที่ Discord อัตโนมัติเมื่อ:

- สต็อกสินค้าต่ำกว่าขั้นต่ำ
- มีออเดอร์ใหม่เข้ามา
- มีการรับ/เบิกสินค้า

### ตั้งค่า Cron Job (หลัง Deploy)

```bash
# แจ้งเตือนสต็อกใกล้หมด ทุกวัน 8:00 น.
0 8 * * * curl -s -X POST https://your-domain.com/api/notify/low-stock \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### ทดสอบแจ้งเตือน

```bash
curl -X POST http://localhost:3000/api/notify/low-stock \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔄 CI/CD Pipeline (Jenkins)

```
Git Push → Jenkins Webhook
       → Lint (ESLint)
       → Test (Jest)
       → Build (next build)
       → Docker Build
       → Deploy Staging
       → Deploy Production
```

> 📌 Jenkins configuration อยู่ในแผนพัฒนาต่อไป

---

## 📝 TODO

- [x] ระบบ Login / Auth (NextAuth v5)
- [x] จัดการสินค้า พร้อมรูปภาพ Lightbox
- [x] จัดการออเดอร์ PO/SO
- [x] รับ/เบิกสินค้า
- [x] ระบบแจ้งเตือน Discord Webhook
- [x] Modal Confirm ก่อนลบ
- [ ] Search และ Filter ในหน้าสินค้าและออเดอร์
- [ ] Export รายงาน PDF / Excel
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
