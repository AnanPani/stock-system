export async function sendDiscordNotify(content: string, embeds?: DiscordEmbed[]) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL not set')
    return
  }

  try {
    const body: { content?: string; embeds?: DiscordEmbed[] } = {}
    if (content) body.content = content
    if (embeds)  body.embeds  = embeds

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('Discord Webhook failed:', await res.text())
    }
  } catch (error) {
    console.error('Discord Webhook error:', error)
  }
}

type DiscordEmbed = {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string }
  timestamp?: string
}

export async function sendLowStockAlert(products: {
  name: string
  code: string
  quantity: number
  minStock: number
  unit: string | null
}[]) {
  if (products.length === 0) return

  const now = new Date().toLocaleString('th-TH', {
    timeZone:  'Asia/Bangkok',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const fields = products.map((p) => ({
    name:   `📦 ${p.name}`,
    value:  `รหัส: \`${p.code}\`\nคงเหลือ: **${p.quantity}** / ขั้นต่ำ: **${p.minStock}** ${p.unit ?? 'ชิ้น'}`,
    inline: true,
  }))

  const embed: DiscordEmbed = {
    title:       '⚠️ แจ้งเตือน: สต็อกใกล้หมด!',
    description: `พบสินค้า **${products.length} รายการ** ที่สต็อกต่ำกว่าขั้นต่ำ กรุณาสั่งซื้อเพิ่ม`,
    color:       0xFF4444,
    fields,
    footer:      { text: `StockSystem • ${now}` },
    timestamp:   new Date().toISOString(),
  }

  await sendDiscordNotify('', [embed])
}

export async function sendOrderAlert(orderNo: string, type: string, totalAmount: number) {
  const typeLabel =
    type === 'purchase' ? 'สั่งซื้อเข้า (PO)' :
    type === 'sale'     ? 'ขายออก (SO)'       : 'เบิกภายใน'

  const embed: DiscordEmbed = {
    title:       '🛒 ออเดอร์ใหม่!',
    description: `มีออเดอร์ใหม่เข้ามาในระบบ`,
    color:       0x5865F2,
    fields: [
      { name: 'เลขที่ออเดอร์', value: `\`${orderNo}\``,  inline: true },
      { name: 'ประเภท',        value: typeLabel,           inline: true },
      { name: 'มูลค่า',        value: `฿${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer:    { text: 'StockSystem' },
  }

  await sendDiscordNotify('', [embed])
}

export async function sendStockMovementAlert(
  type: 'receive' | 'issue',
  items: { name: string; quantity: number; unit: string | null }[]
) {
  const isReceive = type === 'receive'

  const embed: DiscordEmbed = {
    title:       isReceive ? '📥 รับสินค้าเข้าคลัง' : '📤 เบิกสินค้าออกจากคลัง',
    description: `มีการ${isReceive ? 'รับสินค้าเข้า' : 'เบิกสินค้าออก'} **${items.length} รายการ**`,
    color:       isReceive ? 0x57F287 : 0xFEE75C,
    fields: items.map((item) => ({
      name:   item.name,
      value:  `จำนวน: **${item.quantity}** ${item.unit ?? 'ชิ้น'}`,
      inline: true,
    })),
    timestamp: new Date().toISOString(),
    footer:    { text: 'StockSystem' },
  }

  await sendDiscordNotify('', [embed])
}