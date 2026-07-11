// ຟັງຊັນຊ່ວຍ — ຄັດລອກ logic ຈາກລະບົບຕົ້ນສະບັບໃຫ້ຄືເກົ່າທຸກຢ່າງ

// ແປງ "6/7/26" (ວັນ/ເດືອນ/ປີ) ເປັນ Date; ຄืນ null ຖ້າບໍ່ຖືກຕ້ອງ
export function parseDMY(str) {
  const p = String(str).split('/')
  if (p.length < 3) return null
  let y = +p[2]
  if (y < 100) y += 2000
  const d = new Date(y, +p[1] - 1, +p[0])
  return isNaN(d) ? null : d
}

// ແປງ Date ເປັນ ISO "YYYY-MM-DD" (ໃຊ້ກັບ input[type=date])
export function toISO(d) {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

// ຈັດຮູບແບບຕົວເລກ (ບໍ່ມີທົດ)
export function fmt(n) {
  return (Math.round(n) || 0).toLocaleString('en-US')
}

// ຈັດຮູບແບບຕົວເລກ (2 ຕຳແໜ່ງທົດ)
export function fmt2(n) {
  return (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ຄິດໄລ່ເປີເຊັນດອກເບ້ຍຈາກ loan/pay
export function pctOf(e) {
  if (!e.loan) return 0
  return Math.round((e.pay / e.loan - 1) * 1000) / 10
}

// ດຶງເອົາຕົວເລກອອກຈາກ string (ຕັດ "," ແລະ ອື່ນໆ)
export function parseNum(str) {
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0
}

// ປັດຂຶ້ນ (ceil) ໄປຫາທະວີຄູນຂອງ 500 ກີບ ສະເໝີ
// ເສດ < 500 → ຂຶ້ນເປັນ 500 (85,300 → 85,500); ເສດ > 500 → ຂຶ້ນເປັນ 1,000 (85,714 → 86,000)
export function roundKip(n, step = 500) {
  return Math.ceil((Number(n) || 0) / step) * step
}

// "6/7/26" (D/M/YY) -> "2026-07-06" (ISO ສຳລັບ input[type=date]); "" ຖ້າແປງບໍ່ໄດ້
export function dmyToISO(dmy) {
  const d = parseDMY(dmy)
  return d ? toISO(d) : ''
}

// ນັບຈຳນວນວັນລະຫວ່າງ 2 ວັນທີ່ (D/M/YY) — ຄืน 0 ຖ້າແປງບໍ່ໄດ້ ຫຼື ≤ 0
export function daysBetween(startDmy, endDmy) {
  const s = parseDMY(startDmy)
  const e = parseDMY(endDmy)
  if (!s || !e) return 0
  const n = Math.round((e - s) / 86400000)
  return n > 0 ? n : 0
}

// "2026-07-06" (ISO) -> "6/7/26" (D/M/YY); "" ຖ້າຫວ່າງ
export function isoToDMY(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('-')
  if (!y || !m || !d) return ''
  return `${+d}/${+m}/${String(y).slice(2)}`
}
