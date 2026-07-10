# ລະບົບການກູ້ຢືມເງິນ (Vue 3)

ລະບົບຕິດຕາມການປ່ອຍກູ້ · ດອກເບ້ຍ · ແລະ ການຊຳລະຄືນ — ສ້າງໃໝ່ດ້ວຍ **Vue 3 + Vite**
(Composition API / `<script setup>`) ຈາກໄຟລ໌ HTML standalone ຕົ້ນສະບັບ.

A loan-tracking system (Lao language), rebuilt as a Vue 3 + Vite app.
Behaviour and appearance match the original 1:1, and it shares the same
`localStorage` key as the HTML/React versions.

## ຄຸນສົມບັດ / Features

- 📊 ສະຫຼຸບຍอด: ຍอດປ່ອຍກູ້ · ຍอດຕ້ອງຮັບຄືນ · ກຳໄລ (ດອກເບ້ຍ)
- 🗂️ 2 ມຸມມอง: **ຕາຕະລາງລວມ** ແລະ **ແຍກຕາມລາຍຊື່**
- 📅 ຕົວກรອງຊ່ວງວັນທີ່ (ລາຍວັນ / ລາຍເດືອນ / ລາຍປີ / ລ້າງ)
- ➕ ເพີ່ມ · ✎ ແກ້ໄຂ · ✕ ລຶບ · ✓ ສະຫຼັບສະຖານະ
- 💾 ບັນທຶກອັດຕະໂນມັດໃສ່ `localStorage` (key: `loanapp_v1`)

## ການໃຊ້ງານ / Getting started

```bash
cd loan-app-vue
npm install
npm run dev      # ເปิด dev server (Vite)
npm run build    # build production → dist/
npm run preview  # ເບิ่ง build
```

## ໂຄງສ້າງ / Structure

```
src/
  main.js               createApp + props (accentColor, defaultPct)
  App.vue               state (ref/reactive) + computed vals + handlers
  helpers.js            parseDMY / toISO / fmt / fmt2 / pctOf / parseNum
  seed.js               ຂໍ້ມູນເລີ່ມຕົ້ນ 23 ລາຍການ
  style.css             global styles + ฟอนต์
  components/
    AppHeader.vue       แถบสรุปยอดด้านบน
    Toolbar.vue         แท็บ + ปุ่มเพิ่ม + จำนวนรายการ
    DateFilter.vue      ตัวกรองช่วงวันที่
    CombinedTable.vue   ตารางรวมทั้งหมด
    ByNameView.vue      แยกตามรายชื่อ (1 การ์ด/คน)
    FormModal.vue       ฟอร์มเพิ่ม/แก้ไข
```

> ໝາຍເຫດ: ໃຊ້ `:style="'...'"` binding ຂອງ Vue ຈຶ่ງເກັບ CSS string ຈາກຕົ້ນສະບັບໄວ້ໄດ້ໂດຍກົງ.
> ຟอนต์ **Noto Sans Lao** ໂຫຼດຜ່ານ Google Fonts (ຕ້ອງມีอินเทอร์เน็ต).
